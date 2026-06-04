import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const studentSelectFields = "id, student_code, first_name, last_name, phone, parent_phone, address, joining_date, status, created_at";

// @desc    Create a new student
// @route   POST /api/v1/students
const createStudent = asyncHandler(async (req, res) => {
  const {
    user_id,
    student_code,
    first_name,
    last_name,
    phone,
    parent_phone,
    address,
    joining_date,
    status,
  } = req.body;

  if (
    !user_id ||
    !student_code ||
    !first_name ||
    !last_name ||
    !phone ||
    !joining_date
  ) {
    throw new ApiError(400, "Please provide all required fields");
  }

  const { data: userExists } = await supabase
    .from("users")
    .select("id")
    .eq("id", user_id)
    .single();

  if (!userExists) {
    throw new ApiError(400, "User not found");
  }

  const { data, error } = await supabase
    .from("students")
    .insert([
      {
        user_id,
        student_code,
        first_name,
        last_name,
        phone,
        parent_phone,
        address,
        joining_date,
        status: status || "ACTIVE",
      },
    ])
    .select(studentSelectFields);

  if (error) {
    throw new ApiError(500, error.message || "Failed to create student");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, data[0], "Student created successfully"));
});

// @desc    Get all students
// @route   GET /api/v1/students
const getStudents = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from("students").select(studentSelectFields);

  if (error) {
    throw new ApiError(500, error.message || "Failed to fetch students");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Students fetched successfully"));
});

// @desc    Get single student by ID
// @route   GET /api/v1/students/:id
const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("students")
    .select(studentSelectFields)
    .eq("id", id)
    .single();

  if (error) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Student fetched successfully"));
});

// @desc    Update student
// @route   PUT /api/v1/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
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
    .eq("id", id)
    .select(studentSelectFields);

  if (error) {
    throw new ApiError(500, error.message || "Failed to update student");
  }

  if (!data || data.length === 0) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, data[0], "Student updated successfully"));
});

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("students")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    throw new ApiError(500, error.message || "Failed to delete student");
  }

  if (!data || data.length === 0) {
    throw new ApiError(404, "Student not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Student deleted successfully"));
});

export {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
