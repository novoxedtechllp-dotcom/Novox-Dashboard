import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, extractPublicIdFromUrl, deleteFromCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt";

const studentSelectFields = "id, student_code, first_name, last_name, phone, parent_phone, address, joining_date, status, avatar_url, created_at";

// ==========================================
// CORE STUDENT CRUD
// ==========================================

const generateNextStudentCode = async () => {
  const { data } = await supabase
    .from("students")
    .select("student_code")
    .like("student_code", "NVX-S%")
    .order("student_code", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    const lastCode = data[0].student_code; // e.g. "NVX-S0012"
    const numPart = parseInt(lastCode.replace("NVX-S", ""), 10) || 0;
    return `NVX-S${String(numPart + 1).padStart(4, "0")}`;
  }
  return "NVX-S0001";
};

// @desc    Create a new student
// @route   POST /api/v1/students
const createStudent = asyncHandler(async (req, res) => {
  const {
    user_id,
    email,
    password,
    student_code,
    first_name,
    last_name,
    phone,
    parent_phone,
    address,
    joining_date,
    course_id,
    avatar_url
  } = req.body;

  if (!first_name || !last_name || !phone || !joining_date) {
    throw new ApiError(400, "Please provide all required fields");
  }

  let avatarUrl = avatar_url || null;
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult?.url) avatarUrl = uploadResult.url;
  }

  const finalStudentCode = student_code || await generateNextStudentCode();

  let studentUserId = user_id;
  let createdUserId = null;

  if (studentUserId) {
    const { data: userExists } = await supabase.from("users").select("id").eq("id", studentUserId).single();
    if (!userExists) throw new ApiError(400, "User not found");
  } else {
    const loginEmail = email || `${finalStudentCode.toLowerCase()}@students.novox.local`;
    const loginPassword = password || `${finalStudentCode}@123`;
    const hashedPassword = await bcrypt.hash(loginPassword, 10);

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([{
        email: loginEmail,
        password_hash: hashedPassword,
        role: "STUDENT",
        status: "ACTIVE",
      }])
      .select("id")
      .single();

    if (userError) throw new ApiError(500, userError.message || "Failed to create student user");

    studentUserId = user.id;
    createdUserId = user.id;
  }

  const { data, error } = await supabase
    .from("students")
    .insert([{
      user_id: studentUserId, student_code: finalStudentCode, first_name, last_name, phone, parent_phone,
      address, joining_date, status: "ACTIVE", avatar_url: avatarUrl
    }])
    .select(studentSelectFields);

  if (error) {
    if (createdUserId) await supabase.from("users").delete().eq("id", createdUserId);
    throw new ApiError(500, error.message || "Failed to create student");
  }

  const newStudent = data[0];

  if (course_id) {
    // Assign course
    const { error: courseError } = await supabase
      .from("student_courses")
      .insert([{ 
        student_id: newStudent.id, 
        course_id, 
        progress_percentage: 0,
        completion_status: 'IN_PROGRESS'
      }]);

    if (!courseError) {
      // Auto-assign existing tasks for this course
      const { data: modulesTasks } = await supabase
        .from("course_modules")
        .select('id, course_submodules(id, course_tasks(id))')
        .eq('course_id', course_id);

      if (modulesTasks && modulesTasks.length > 0) {
        const tasksToAssign = [];
        modulesTasks.forEach(module => {
          module.course_submodules?.forEach(sub => {
            sub.course_tasks?.forEach(task => {
              tasksToAssign.push({
                student_id: newStudent.id,
                task_id: task.id,
                status: 'PENDING'
              });
            });
          });
        });

        if (tasksToAssign.length > 0) {
          await supabase.from("student_tasks").insert(tasksToAssign);
        }
      }
    }
  }

  return res.status(201).json(new ApiResponse(201, newStudent, "Student created successfully"));
});

// @desc    Get all students with filters
// @route   GET /api/v1/students
const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, courseId, status, search } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  let query;

  if (courseId) {
    query = supabase.from("students").select(`
      ${studentSelectFields},
      student_courses!inner(course_id)
    `, { count: "exact" }).eq("student_courses.course_id", courseId);
  } else {
    query = supabase.from("students").select(studentSelectFields, { count: "exact" });
  }

  if (status) query = query.eq("status", status);
  
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_code.ilike.%${search}%`);
  }

  query = query.range(offset, offset + limitNum - 1);

  const { data, error, count } = await query;

  if (error) throw new ApiError(500, error.message || "Failed to fetch students");

  const formattedData = courseId ? data.map(s => {
    const { student_courses, ...rest } = s;
    return rest;
  }) : data;

  return res.status(200).json(new ApiResponse(200, {
    students: formattedData,
    total: count,
    page: pageNum,
    limit: limitNum
  }, "Students fetched successfully"));
});

// @desc    Get single student by ID
// @route   GET /api/v1/students/:id
const getStudentById = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabase
    .from("students")
    .select(studentSelectFields)
    .eq("id", studentId)
    .single();

  if (error) throw new ApiError(404, "Student not found");

  return res.status(200).json(new ApiResponse(200, data, "Student fetched successfully"));
});

// @desc    Update student
// @route   PUT /api/v1/students/:id
export const updateStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { first_name, last_name, phone, parent_phone, address, status, avatar_url } = req.body;

  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (parent_phone !== undefined) updates.parent_phone = parent_phone;
  if (address !== undefined) updates.address = address;
  if (status !== undefined) updates.status = status;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult?.url) {
      updates.avatar_url = uploadResult.url;

      const { data: oldStudent } = await supabase.from("students").select("avatar_url").eq("id", studentId).single();
      if (oldStudent?.avatar_url) {
        const publicId = extractPublicIdFromUrl(oldStudent.avatar_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    }
  }

  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", studentId)
    .select(studentSelectFields);

  if (error) throw new ApiError(500, error.message || "Failed to update student");
  if (!data || data.length === 0) throw new ApiError(404, "Student not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Student updated successfully"));
});

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete student");
  if (!data || data.length === 0) throw new ApiError(404, "Student not found");

  return res.status(200).json(new ApiResponse(200, {}, "Student deleted successfully"));
});

// ==========================================
// STUDENT COURSES & PROGRESS
// ==========================================

// @desc    Assign course to student
// @route   POST /api/v1/students/:studentId/courses
const assignCourse = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { course_id } = req.body;

  if (!course_id) throw new ApiError(400, "Please provide course_id");

  const { data: existing } = await supabase
    .from("student_courses")
    .select("id")
    .eq("student_id", studentId)
    .eq("course_id", course_id)
    .single();

  if (existing) throw new ApiError(409, "Course already assigned to this student");

  const { data, error } = await supabase
    .from("student_courses")
    .insert([{ 
      student_id: studentId, 
      course_id, 
      progress_percentage: 0,
      completion_status: 'IN_PROGRESS'
    }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to assign course");

  // Auto-assign existing tasks for this course
  const { data: modulesTasks } = await supabase
    .from("course_modules")
    .select('id, course_submodules(id, course_tasks(id))')
    .eq('course_id', course_id);

  if (modulesTasks && modulesTasks.length > 0) {
    const tasksToAssign = modulesTasks.flatMap(m => 
      m.course_submodules.flatMap(sm => 
        sm.course_tasks.map(t => ({
          student_id: studentId,
          task_id: t.id,
          status: 'PENDING'
        }))
      )
    );

    if (tasksToAssign.length > 0) {
      const { error: taskError } = await supabase.from("student_tasks").insert(tasksToAssign);
      if (taskError) console.error("Failed to auto-assign tasks:", taskError);
    }
  }

  return res.status(201).json(new ApiResponse(201, data[0], "Course assigned successfully"));
});

// @desc    Get student progress
// @route   GET /api/v1/students/:studentId/progress
const getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabase
    .from("student_courses")
    .select(`
      id, course_id, progress_percentage, completion_status, enrolled_at,
      courses(name, track)
    `)
    .eq("student_id", studentId);

  if (error) throw new ApiError(500, error.message || "Failed to fetch student progress");

  return res.status(200).json(new ApiResponse(200, data, "Student progress fetched successfully"));
});

// @desc    Get student tasks
// @route   GET /api/v1/students/:studentId/tasks
const getStudentTasks = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabase
    .from("student_tasks")
    .select(`
      id, student_id, task_id, status, submission_url, grade, feedback, submitted_at,
      course_tasks(title, description, sequence_order, submodule_id, due_date, task_type, course_submodules(title, scheduled_date, module_id, course_modules(title, course_id, courses(name))))
    `)
    .eq("student_id", studentId);

  if (error) throw new ApiError(500, error.message || "Failed to fetch student tasks");

  return res.status(200).json(new ApiResponse(200, data, "Student tasks fetched successfully"));
});

// @desc    Update student task (submit or grade)
// @route   PUT /api/v1/students/:studentId/tasks/:taskId
const updateStudentTask = asyncHandler(async (req, res) => {
  const { studentId, taskId } = req.params;
  const { status, submission_url, grade, feedback } = req.body;

  const updates = {};
  if (status !== undefined) updates.status = status;
  if (submission_url !== undefined) updates.submission_url = submission_url;
  if (grade !== undefined) updates.grade = grade;
  if (feedback !== undefined) updates.feedback = feedback;

  if (status === 'SUBMITTED' && !updates.submitted_at) {
    updates.submitted_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("student_tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("student_id", studentId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update student task");
  if (!data || data.length === 0) throw new ApiError(404, "Student task not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Student task updated successfully"));
});

// ==========================================
// STUDENT REPORTS
// ==========================================

// @desc    Get global student reports
// @route   GET /api/v1/students/reports
const getStudentReports = asyncHandler(async (req, res) => {
  const { count: totalActive } = await supabase.from("students").select("*", { count: 'exact', head: true }).eq("status", "ACTIVE");
  const { count: totalCompleted } = await supabase.from("students").select("*", { count: 'exact', head: true }).eq("status", "COMPLETED");
  const { count: totalDropped } = await supabase.from("students").select("*", { count: 'exact', head: true }).eq("status", "DROPPED");
  
  return res.status(200).json(new ApiResponse(200, {
    totalActive,
    totalCompleted,
    totalDropped
  }, "Student reports fetched successfully"));
});

// ==========================================
// STUDENT DOCUMENTS
// ==========================================

// @desc    Add student document
// @route   POST /api/v1/students/:studentId/documents
const addStudentDocument = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { document_type, document_url } = req.body;

  if (!document_type || !document_url) throw new ApiError(400, "Please provide document_type and document_url");

  const { data, error } = await supabase
    .from("student_documents")
    .insert([{ student_id: studentId, document_type, document_url }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to add document");

  return res.status(201).json(new ApiResponse(201, data[0], "Document added successfully"));
});

// @desc    Get student documents
// @route   GET /api/v1/students/:studentId/documents
const getStudentDocuments = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const { data, error } = await supabase
    .from("student_documents")
    .select("id, document_type, document_url, uploaded_at")
    .eq("student_id", studentId);

  if (error) throw new ApiError(500, error.message || "Failed to fetch documents");

  return res.status(200).json(new ApiResponse(200, data, "Documents fetched successfully"));
});

// @desc    Delete student document
// @route   DELETE /api/v1/students/:studentId/documents/:documentId
const deleteStudentDocument = asyncHandler(async (req, res) => {
  const { studentId, documentId } = req.params;

  const { data, error } = await supabase
    .from("student_documents")
    .delete()
    .eq("id", documentId)
    .eq("student_id", studentId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete document");
  if (!data || data.length === 0) throw new ApiError(404, "Document not found");

  return res.status(200).json(new ApiResponse(200, {}, "Document deleted successfully"));
});
// @desc    Get Student Daily Plan
// @route   GET /api/v1/students/:studentId/daily-plan
const getStudentDailyPlan = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { date } = req.query;

  if (!date) throw new ApiError(400, "Please provide a date query parameter");

  // Fetch courses this student is enrolled in
  const { data: enrollments, error: enrollError } = await supabase
    .from("student_courses")
    .select("course_id")
    .eq("student_id", studentId);

  if (enrollError) throw new ApiError(500, "Failed to fetch student courses");

  if (!enrollments || enrollments.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No courses enrolled"));
  }

  const courseIds = enrollments.map(e => e.course_id);

  // Fetch submodules for those courses scheduled on the given date
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

export {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  assignCourse,
  getStudentProgress,
  getStudentReports,
  addStudentDocument,
  getStudentDocuments,
  deleteStudentDocument,
  getStudentTasks,
  updateStudentTask,
  getStudentDailyPlan
};
