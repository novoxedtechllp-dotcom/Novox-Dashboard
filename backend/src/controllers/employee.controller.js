import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, extractPublicIdFromUrl, deleteFromCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt";

const parseDateOnly = (value) => {
  const [year, month, day] = String(value || "").split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

const resolveEmployeeProfileId = async (employeeId) => {
  const { data: profileById } = await supabase
    .from("employee_profiles")
    .select("id")
    .eq("id", employeeId)
    .single();

  if (profileById?.id) return profileById.id;

  const { data: profileByUserId } = await supabase
    .from("employee_profiles")
    .select("id")
    .eq("user_id", employeeId)
    .single();

  return profileByUserId?.id || employeeId;
};

const getAssignedCourseIds = async (employeeId) => {
  const instructorEmployeeId = await resolveEmployeeProfileId(employeeId);
  const { data: assignments, error } = await supabase
    .from("course_instructors")
    .select("course_id")
    .eq("employee_id", instructorEmployeeId);

  if (error) throw new ApiError(500, "Failed to fetch employee courses");

  return {
    instructorEmployeeId,
    courseIds: (assignments || []).map((assignment) => assignment.course_id),
  };
};

// ==========================================
// EMPLOYEE PROFILES
// ==========================================

const generateNextEmployeeCode = async () => {
  const { data } = await supabase
    .from("employee_profiles")
    .select("employee_code")
    .like("employee_code", "NVX-E%")
    .order("employee_code", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    const lastCode = data[0].employee_code;
    const numPart = parseInt(lastCode.replace("NVX-E", ""), 10) || 0;
    return `NVX-E${String(numPart + 1).padStart(4, "0")}`;
  }
  return "NVX-E0001";
};

// @desc    Create a new employee
// @route   POST /api/v1/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const {
    user_id,
    email,
    password,
    employee_code,
    first_name,
    last_name,
    phone,
    joining_date,
    designation,
    role_id,
    employee_role,
    department,
    salary,
    status,
    avatar_url
  } = req.body;

  if (!first_name || !last_name) {
    throw new ApiError(400, "Please provide all required fields");
  }

  let avatarUrl = avatar_url || null;
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult?.url) avatarUrl = uploadResult.url;
  }

  let employeeUserId = user_id;
  let employeeRoleId = role_id;
  let createdUserId = null;
  const roleName = employee_role || department || "DEVELOPMENT";
  const employeeCode = employee_code || await generateNextEmployeeCode();

  if (!employeeRoleId) {
    const { data: roleData, error: roleError } = await supabase
      .from("employee_roles")
      .select("id")
      .eq("role_name", roleName)
      .single();

    if (roleError || !roleData) throw new ApiError(400, `Invalid employee role specified: ${roleName}`);
    employeeRoleId = roleData.id;
  }

  let loginPassword = null;
  if (employeeUserId) {
    const { data: userExists } = await supabase.from("users").select("id").eq("id", employeeUserId).single();
    if (!userExists) throw new ApiError(400, "User not found");
  } else {
    const loginEmail = email || `${employeeCode.toLowerCase()}@employees.novox.local`;
    loginPassword = password || `${employeeCode}@123`;
    const hashedPassword = await bcrypt.hash(loginPassword, 10);

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([{ email: loginEmail, password_hash: hashedPassword, role: "EMPLOYEE", status: "ACTIVE" }])
      .select("id")
      .single();

    if (userError) throw new ApiError(500, userError.message || "Failed to create employee user");

    employeeUserId = user.id;
    createdUserId = user.id;
  }

  const { data, error } = await supabase
    .from("employee_profiles")
    .insert([
      {
        user_id: employeeUserId,
        employee_code: employeeCode,
        first_name,
        last_name,
        phone,
        joining_date: joining_date || new Date().toISOString().split("T")[0],
        designation: designation || roleName,
        role_id: employeeRoleId,
        salary: salary || 0,
        status: status || 'ACTIVE',
        avatar_url: avatarUrl,
      },
    ])
    .select();

  if (error) {
    if (createdUserId) await supabase.from("users").delete().eq("id", createdUserId);
    throw new ApiError(500, error.message || "Failed to create employee");
  }

  // Return the default password if one was auto-generated
  const responseData = { ...data[0] };
  if (!password && loginPassword) {
    responseData._defaultPassword = loginPassword;
  }

  return res.status(201).json(new ApiResponse(201, responseData, "Employee created successfully"));
});

// @desc    Get all employees
// @route   GET /api/v1/employees
export const getEmployees = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("employee_profiles")
    .select(`
      *,
      employee_roles(role_name),
      users(email, role, status)
    `);

  if (error) throw new ApiError(500, error.message || "Failed to fetch employees");

  return res.status(200).json(new ApiResponse(200, data, "Employees fetched successfully"));
});

// @desc    Get single employee by ID
// @route   GET /api/v1/employees/:id
export const getEmployeeById = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const { data, error } = await supabase
    .from("employee_profiles")
    .select(`
      *,
      employee_roles(role_name),
      users(email, role, status),
      employee_documents(*),
      course_instructors(courses(name, track, status))
    `)
    .eq("id", employeeId)
    .single();

  if (error) throw new ApiError(404, "Employee not found");

  return res.status(200).json(new ApiResponse(200, data, "Employee fetched successfully"));
});

// @desc    Update employee (e.g., status, role, details)
// @route   PUT /api/v1/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { first_name, last_name, phone, designation, status, joining_date, role_id, employee_role, department, salary, avatar_url } = req.body;

  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (designation !== undefined) updates.designation = designation;
  if (status !== undefined) updates.status = status;
  if (joining_date !== undefined) updates.joining_date = joining_date;
  if (salary !== undefined) updates.salary = salary;
  if (role_id !== undefined) updates.role_id = role_id;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult?.url) {
      updates.avatar_url = uploadResult.url;

      // Delete old avatar from Cloudinary
      const { data: oldProfile } = await supabase.from("employee_profiles").select("avatar_url").eq("id", employeeId).single();
      if (oldProfile?.avatar_url) {
        const publicId = extractPublicIdFromUrl(oldProfile.avatar_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    }
  }

  if (role_id === undefined && (employee_role !== undefined || department !== undefined)) {
    const roleName = employee_role || department;
    const { data: roleData, error: roleError } = await supabase
      .from("employee_roles")
      .select("id")
      .eq("role_name", roleName)
      .single();

    if (roleError || !roleData) throw new ApiError(400, `Invalid employee role specified: ${roleName}`);
    updates.role_id = roleData.id;
  }

  const { data, error } = await supabase
    .from("employee_profiles")
    .update(updates)
    .eq("id", employeeId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update employee");
  if (!data || data.length === 0) throw new ApiError(404, "Employee not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Employee updated successfully"));
});

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  const { data: employee } = await supabase
    .from("employee_profiles")
    .select("user_id")
    .eq("id", employeeId)
    .single();

  const { data, error } = await supabase
    .from("employee_profiles")
    .update({ status: 'TERMINATED' })
    .eq("id", employeeId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete employee");
  if (!data || data.length === 0) throw new ApiError(404, "Employee not found");

  if (employee?.user_id) await supabase.from("users").update({ status: 'INACTIVE' }).eq("id", employee.user_id);

  return res.status(200).json(new ApiResponse(200, {}, "Employee deleted successfully (soft delete)"));
});

// ==========================================
// EMPLOYEE DOCUMENTS
// ==========================================

// @desc    Add employee document
// @route   POST /api/v1/employees/:id/documents
export const addEmployeeDocument = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { document_name, cloudinary_url } = req.body;

  if (!document_name || !cloudinary_url) {
    throw new ApiError(400, "Please provide document_name and cloudinary_url");
  }

  const { data, error } = await supabase
    .from("employee_documents")
    .insert([{ employee_id: employeeId, document_name, cloudinary_url }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to add document");

  return res.status(201).json(new ApiResponse(201, data[0], "Document added successfully"));
});

// @desc    Delete employee document
// @route   DELETE /api/v1/employees/:id/documents/:docId
export const deleteEmployeeDocument = asyncHandler(async (req, res) => {
  const { employeeId, docId } = req.params;

  const { data, error } = await supabase
    .from("employee_documents")
    .delete()
    .eq("id", docId)
    .eq("employee_id", employeeId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete document");
  if (!data || data.length === 0) throw new ApiError(404, "Document not found");

  return res.status(200).json(new ApiResponse(200, {}, "Document deleted successfully"));
});

// ==========================================
// EMPLOYEE COURSES
// ==========================================

// @desc    Assign course to employee (instructor)
// @route   POST /api/v1/employees/:id/courses
export const assignCourse = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { course_id } = req.body;

  if (!course_id) throw new ApiError(400, "Please provide course_id");

  const { data: existing } = await supabase
    .from("course_instructors")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("course_id", course_id)
    .single();

  if (existing) throw new ApiError(409, "Course already assigned to this employee");

  const { data, error } = await supabase
    .from("course_instructors")
    .insert([{ employee_id: employeeId, course_id }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to assign course");

  return res.status(201).json(new ApiResponse(201, data[0], "Course assigned successfully"));
});

// @desc    Remove course from employee
// @route   DELETE /api/v1/employees/:id/courses/:courseId
export const removeCourse = asyncHandler(async (req, res) => {
  const { employeeId, courseId } = req.params;

  const { data, error } = await supabase
    .from("course_instructors")
    .delete()
    .eq("course_id", courseId)
    .eq("employee_id", employeeId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to remove course assignment");
  if (!data || data.length === 0) throw new ApiError(404, "Course assignment not found");

  return res.status(200).json(new ApiResponse(200, {}, "Course removed successfully"));
});

// ==========================================
// EMPLOYEE REPORT
// ==========================================

// @desc    Get Employee Summary Report
// @route   GET /api/v1/employees/:id/report
export const getEmployeeReport = asyncHandler(async (req, res) => {
  const { count: totalActive } = await supabase.from("employee_profiles").select("*", { count: 'exact', head: true }).eq("status", "ACTIVE");
  const { count: totalOnLeave } = await supabase.from("employee_profiles").select("*", { count: 'exact', head: true }).eq("status", "ON_LEAVE");
  const { count: totalTerminated } = await supabase.from("employee_profiles").select("*", { count: 'exact', head: true }).eq("status", "TERMINATED");

  return res.status(200).json(new ApiResponse(200, {
    totalActive,
    totalOnLeave,
    totalTerminated
  }, "Employee global report generated successfully"));
});

// @desc    Get Employee Daily Plan
// @route   GET /api/v1/employees/:employeeId/daily-plan
export const getEmployeeDailyPlan = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { date } = req.query;

  if (!date) throw new ApiError(400, "Please provide a date query parameter");

  const { courseIds } = await getAssignedCourseIds(employeeId);

  if (courseIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No courses assigned"));
  }

  const { data, error } = await supabase
    .from("course_submodules")
    .select(`
      *,
      course_modules!inner(course_id, title, courses(name)),
      course_tasks(*)
    `)
    .in("course_modules.course_id", courseIds)
    .eq("scheduled_date", date)
    .order("sequence_order", { ascending: true });

  if (error) throw new ApiError(500, error.message || "Failed to fetch daily plan");

  return res.status(200).json(new ApiResponse(200, data, "Daily plan fetched successfully"));
});

// @desc    Get extra topics an instructor can add to a selected day
// @route   GET /api/v1/employees/:employeeId/available-topics
export const getAvailableTeachingTopics = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;
  const { date } = req.query;

  if (!date) throw new ApiError(400, "Please provide a date query parameter");

  const selectedDate = parseDateOnly(date);
  if (!selectedDate) throw new ApiError(400, "Please provide a valid date");
  if (isWeekend(selectedDate)) throw new ApiError(400, "Topics can only be added to Monday-Friday workdays");

  const { courseIds } = await getAssignedCourseIds(employeeId);
  if (courseIds.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No courses assigned"));
  }

  const { data, error } = await supabase
    .from("course_submodules")
    .select(`
      id,
      module_id,
      title,
      description,
      sequence_order,
      scheduled_date,
      course_modules!inner(course_id, title, sequence_order, courses(name))
    `)
    .in("course_modules.course_id", courseIds)
    .order("sequence_order", { ascending: true, foreignTable: "course_modules" })
    .order("sequence_order", { ascending: true });

  if (error) throw new ApiError(500, error.message || "Failed to fetch available topics");

  return res.status(200).json(new ApiResponse(200, data || [], "Curriculum topics fetched successfully"));
});

// @desc    Add or move an assigned course topic to a selected instructor workday
// @route   PATCH /api/v1/employees/:employeeId/topics/:submoduleId/schedule
export const scheduleTeachingTopic = asyncHandler(async (req, res) => {
  const { employeeId, submoduleId } = req.params;
  const { scheduled_date } = req.body;

  let selectedDate = null;
  if (scheduled_date !== null && scheduled_date !== undefined) {
    selectedDate = parseDateOnly(scheduled_date);
    if (!selectedDate) throw new ApiError(400, "Please provide a valid scheduled_date");
    if (isWeekend(selectedDate)) throw new ApiError(400, "Topics can only be scheduled from Monday to Friday");
  }

  const { courseIds } = await getAssignedCourseIds(employeeId);
  if (courseIds.length === 0) throw new ApiError(403, "No courses assigned to this instructor");

  const { data: topic, error: topicError } = await supabase
    .from("course_submodules")
    .select("id, module_id, course_modules!inner(course_id)")
    .eq("id", submoduleId)
    .single();

  if (topicError || !topic) throw new ApiError(404, "Topic not found");
  if (!courseIds.includes(topic.course_modules.course_id)) {
    throw new ApiError(403, "This topic is not assigned to this instructor");
  }

  const { data, error } = await supabase
    .from("course_submodules")
    .update({ scheduled_date })
    .eq("id", submoduleId)
    .select(`
      *,
      course_modules!inner(course_id, title, courses(name)),
      course_tasks(*)
    `)
    .single();

  if (error) throw new ApiError(500, error.message || "Failed to schedule topic");

  return res.status(200).json(new ApiResponse(200, data, "Topic scheduled successfully"));
});
