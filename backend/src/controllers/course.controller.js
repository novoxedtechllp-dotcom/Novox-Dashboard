import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ==========================================
// COURSES
// ==========================================

export const createCourse = asyncHandler(async (req, res) => {
  const { name, description, track, duration_months, capacity, status } = req.body;

  if (!name || !track || !duration_months || !capacity) {
    throw new ApiError(400, "Please provide name, track, duration_months, and capacity");
  }

  const { data, error } = await supabase
    .from("courses")
    .insert([{ name, description, track, duration_months, capacity, status: status || 'DRAFT' }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to create course");

  return res.status(201).json(new ApiResponse(201, data[0], "Course created successfully"));
});

export const getCourses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("courses")
    .select(`*, student_courses(count), course_instructors(employee_profiles(first_name, last_name))`);

  if (error) throw new ApiError(500, error.message || "Failed to fetch courses");

  const formattedData = data.map((course) => ({
    ...course,
    enrollment_count: parseInt(course.student_courses[0]?.count || "0", 10),
  }));

  return res.status(200).json(new ApiResponse(200, formattedData, "Courses fetched successfully"));
});

export const getCourseById = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const { data, error } = await supabase
    .from("courses")
    .select(`*, course_modules(*), course_schedules(*), course_instructors(employee_profiles(*)), student_courses(count)`)
    .eq("id", courseId)
    .single();

  if (error) throw new ApiError(404, "Course not found");

  data.enrollment_count = parseInt(data.student_courses[0]?.count || "0", 10);

  return res.status(200).json(new ApiResponse(200, data, "Course fetched successfully"));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { name, description, track, duration_months, capacity, status } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (track !== undefined) updates.track = track;
  if (duration_months !== undefined) updates.duration_months = duration_months;
  if (capacity !== undefined) updates.capacity = capacity;

  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update course");
  if (!data || data.length === 0) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Course updated successfully"));
});

export const publishCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabase.from("courses").update({ status: 'PUBLISHED' }).eq("id", courseId).select();
  if (error) throw new ApiError(500, error.message || "Failed to publish course");
  if (!data || data.length === 0) throw new ApiError(404, "Course not found");
  return res.status(200).json(new ApiResponse(200, data[0], "Course published successfully"));
});

export const archiveCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabase.from("courses").update({ status: 'ARCHIVED' }).eq("id", courseId).select();
  if (error) throw new ApiError(500, error.message || "Failed to archive course");
  if (!data || data.length === 0) throw new ApiError(404, "Course not found");
  return res.status(200).json(new ApiResponse(200, data[0], "Course archived successfully"));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const { data, error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete course");
  if (!data || data.length === 0) throw new ApiError(404, "Course not found");

  return res.status(200).json(new ApiResponse(200, {}, "Course deleted successfully"));
});

// ==========================================
// COURSE RELATIONS
// ==========================================

export const getCourseStudents = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabase
    .from("student_courses")
    .select('*, students(first_name, last_name, phone)')
    .eq("course_id", courseId);

  if (error) throw new ApiError(500, error.message || "Failed to fetch course students");
  return res.status(200).json(new ApiResponse(200, data, "Course students fetched successfully"));
});

export const getCourseEmployees = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabase
    .from("course_instructors")
    .select('*, employee_profiles(first_name, last_name, designation, phone)')
    .eq("course_id", courseId);

  if (error) throw new ApiError(500, error.message || "Failed to fetch course employees");
  return res.status(200).json(new ApiResponse(200, data, "Course employees fetched successfully"));
});

export const addCourseModule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, sequence_order } = req.body;

  if (!title || sequence_order === undefined || !Number.isInteger(sequence_order) || sequence_order < 0) {
    throw new ApiError(400, "Please provide title and a non-negative integer for sequence_order");
  }

  const { data, error } = await supabase
    .from("course_modules")
    .insert([{ course_id: courseId, title, description, sequence_order }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to add course module");
  return res.status(201).json(new ApiResponse(201, data[0], "Course module added successfully"));
});

export const updateCourseModule = asyncHandler(async (req, res) => {
  const { courseId, moduleId } = req.params;
  const { title, description, sequence_order } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (sequence_order !== undefined) updates.sequence_order = sequence_order;

  const { data, error } = await supabase
    .from("course_modules")
    .update(updates)
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update course module");
  if (!data || data.length === 0) throw new ApiError(404, "Course module not found");
  return res.status(200).json(new ApiResponse(200, data[0], "Course module updated successfully"));
});

export const deleteCourseModule = asyncHandler(async (req, res) => {
  const { courseId, moduleId } = req.params;
  const { data, error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete course module");
  if (!data || data.length === 0) throw new ApiError(404, "Course module not found");
  return res.status(200).json(new ApiResponse(200, {}, "Course module deleted successfully"));
});

export const addCourseSchedule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { start_date, end_date, days_of_week, start_time, end_time } = req.body;

  if (!start_date || !end_date || !days_of_week || !start_time || !end_time) {
    throw new ApiError(400, "Please provide all schedule fields");
  }

  const { data, error } = await supabase
    .from("course_schedules")
    .insert([{ course_id: courseId, start_date, end_date, days_of_week, start_time, end_time }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to add course schedule");
  return res.status(201).json(new ApiResponse(201, data[0], "Course schedule added successfully"));
});

export const deleteCourseSchedule = asyncHandler(async (req, res) => {
  const { courseId, scheduleId } = req.params;
  const { data, error } = await supabase
    .from("course_schedules")
    .delete()
    .eq("id", scheduleId)
    .eq("course_id", courseId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete course schedule");
  if (!data || data.length === 0) throw new ApiError(404, "Course schedule not found");
  return res.status(200).json(new ApiResponse(200, {}, "Course schedule deleted successfully"));
});

export const assignInstructorToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { employee_id } = req.body;

  if (!employee_id) throw new ApiError(400, "Please provide employee_id");

  const { data: existing } = await supabase
    .from("course_instructors")
    .select("id")
    .eq("employee_id", employee_id)
    .eq("course_id", courseId)
    .single();

  if (existing) throw new ApiError(409, "Instructor already assigned to this course");

  const { data, error } = await supabase
    .from("course_instructors")
    .insert([{ course_id: courseId, employee_id }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to assign instructor");
  return res.status(201).json(new ApiResponse(201, data[0], "Instructor assigned successfully"));
});

export const removeInstructorFromCourse = asyncHandler(async (req, res) => {
  const { courseId, instructorId } = req.params; 
  const { data, error } = await supabase
    .from("course_instructors")
    .delete()
    .eq("employee_id", instructorId)
    .eq("course_id", courseId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to remove instructor");
  if (!data || data.length === 0) throw new ApiError(404, "Instructor assignment not found");
  return res.status(200).json(new ApiResponse(200, {}, "Instructor removed successfully"));
});
