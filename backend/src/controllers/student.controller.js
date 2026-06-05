import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";

const studentSelectFields = "id, student_code, first_name, last_name, phone, parent_phone, address, joining_date, status, created_at";

// ==========================================
// CORE STUDENT CRUD
// ==========================================

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
    status,
  } = req.body;

  if (!student_code || !first_name || !last_name || !phone || !joining_date) {
    throw new ApiError(400, "Please provide all required fields");
  }

  let studentUserId = user_id;
  let createdUserId = null;

  if (studentUserId) {
    const { data: userExists } = await supabase.from("users").select("id").eq("id", studentUserId).single();
    if (!userExists) throw new ApiError(400, "User not found");
  } else {
    const loginEmail = email || `${student_code.toLowerCase()}@students.novox.local`;
    const loginPassword = password || `${student_code}@123`;
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
      user_id: studentUserId, student_code, first_name, last_name, phone, parent_phone,
      address, joining_date, status: status || "ACTIVE",
    }])
    .select(studentSelectFields);

  if (error) {
    if (createdUserId) await supabase.from("users").delete().eq("id", createdUserId);
    throw new ApiError(500, error.message || "Failed to create student");
  }

  return res.status(201).json(new ApiResponse(201, data[0], "Student created successfully"));
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
const updateStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { first_name, last_name, phone, parent_phone, address, status } = req.body;

  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (parent_phone !== undefined) updates.parent_phone = parent_phone;
  if (address !== undefined) updates.address = address;
  if (status !== undefined) updates.status = status;

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
  deleteStudentDocument
};
