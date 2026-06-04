import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ==========================================
// EMPLOYEE PROFILES
// ==========================================

// @desc    Create a new employee
// @route   POST /api/v1/employees
export const createEmployee = asyncHandler(async (req, res) => {
  const {
    user_id,
    employee_code,
    first_name,
    last_name,
    phone,
    joining_date,
    designation,
    role_id,
    salary,
    status
  } = req.body;

  if (!user_id || !employee_code || !first_name || !last_name || !joining_date || !designation || !role_id || !salary) {
    throw new ApiError(400, "Please provide all required fields");
  }

  const { data: userExists } = await supabase.from("users").select("id").eq("id", user_id).single();
  if (!userExists) throw new ApiError(400, "User not found");

  const { data, error } = await supabase
    .from("employee_profiles")
    .insert([
      {
        user_id,
        employee_code,
        first_name,
        last_name,
        phone,
        joining_date,
        designation,
        role_id,
        salary,
        status: status || 'ACTIVE',
      },
    ])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to create employee");

  return res.status(201).json(new ApiResponse(201, data[0], "Employee created successfully"));
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
  const { id } = req.params;

  const { data, error } = await supabase
    .from("employee_profiles")
    .select(`
      *,
      employee_roles(role_name),
      users(email, role, status),
      employee_documents(*),
      course_instructors(courses(name, track, status))
    `)
    .eq("id", id)
    .single();

  if (error) throw new ApiError(404, "Employee not found");

  return res.status(200).json(new ApiResponse(200, data, "Employee fetched successfully"));
});

// @desc    Update employee (e.g., status, role, details)
// @route   PUT /api/v1/employees/:id
export const updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, phone, designation, status, joining_date } = req.body;

  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (designation !== undefined) updates.designation = designation;
  if (status !== undefined) updates.status = status;
  if (joining_date !== undefined) updates.joining_date = joining_date;

  const { data, error } = await supabase
    .from("employee_profiles")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update employee");
  if (!data || data.length === 0) throw new ApiError(404, "Employee not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Employee updated successfully"));
});

// @desc    Delete employee
// @route   DELETE /api/v1/employees/:id
export const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("employee_profiles")
    .delete()
    .eq("id", id)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete employee");
  if (!data || data.length === 0) throw new ApiError(404, "Employee not found");

  return res.status(200).json(new ApiResponse(200, {}, "Employee deleted successfully"));
});

// ==========================================
// EMPLOYEE DOCUMENTS
// ==========================================

// @desc    Add employee document
// @route   POST /api/v1/employees/:id/documents
export const addEmployeeDocument = asyncHandler(async (req, res) => {
  const { id } = req.params; // employee_id
  const { document_name, cloudinary_url } = req.body;

  if (!document_name || !cloudinary_url) {
    throw new ApiError(400, "Please provide document_name and cloudinary_url");
  }

  const { data, error } = await supabase
    .from("employee_documents")
    .insert([{ employee_id: id, document_name, cloudinary_url }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to add document");

  return res.status(201).json(new ApiResponse(201, data[0], "Document added successfully"));
});

// @desc    Delete employee document
// @route   DELETE /api/v1/employees/:id/documents/:docId
export const deleteEmployeeDocument = asyncHandler(async (req, res) => {
  const { id, docId } = req.params;

  const { data, error } = await supabase
    .from("employee_documents")
    .delete()
    .eq("id", docId)
    .eq("employee_id", id)
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
  const { id } = req.params; // employee_id
  const { course_id } = req.body;

  if (!course_id) throw new ApiError(400, "Please provide course_id");

  const { data: existing } = await supabase
    .from("course_instructors")
    .select("id")
    .eq("employee_id", id)
    .eq("course_id", course_id)
    .single();

  if (existing) throw new ApiError(409, "Course already assigned to this employee");

  const { data, error } = await supabase
    .from("course_instructors")
    .insert([{ employee_id: id, course_id }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to assign course");

  return res.status(201).json(new ApiResponse(201, data[0], "Course assigned successfully"));
});

// @desc    Remove course from employee
// @route   DELETE /api/v1/employees/:id/courses/:courseId
export const removeCourse = asyncHandler(async (req, res) => {
  const { id, courseId } = req.params;

  const { data, error } = await supabase
    .from("course_instructors")
    .delete()
    .eq("course_id", courseId)
    .eq("employee_id", id)
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
  const { id } = req.params;

  // Fetch basic profile, role, documents, and courses
  const { data: profile, error: profileError } = await supabase
    .from("employee_profiles")
    .select(`
      *,
      employee_roles(role_name),
      users(email, role, status),
      employee_documents(*),
      course_instructors(courses(name, track, status))
    `)
    .eq("id", id)
    .single();

  if (profileError) throw new ApiError(404, "Employee not found");

  // Generate some aggregate report data
  const reportData = {
    employee_code: profile.employee_code,
    name: `${profile.first_name} ${profile.last_name}`,
    status: profile.status,
    role: profile.employee_roles?.role_name,
    total_documents: profile.employee_documents?.length || 0,
    total_courses_instructing: profile.course_instructors?.length || 0,
    documents: profile.employee_documents,
    courses: profile.course_instructors?.map(c => c.courses),
    joining_date: profile.joining_date,
    salary: profile.salary
  };

  return res.status(200).json(new ApiResponse(200, reportData, "Employee report generated successfully"));
});
