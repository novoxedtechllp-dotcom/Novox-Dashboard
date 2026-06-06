import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, extractPublicIdFromUrl, deleteFromCloudinary } from "../utils/cloudinary.js";

const DEFAULT_TOPICS_PER_DAY = 2;
const MIN_TOPICS_PER_DAY = 1;
const MAX_TOPICS_PER_DAY = 10;

const parseDateOnly = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const [year, month, day] = String(value).split("T")[0].split("-").map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

const toDateOnlyString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

const moveToNextWorkday = (date) => {
  while (isWeekend(date)) {
    date.setDate(date.getDate() + 1);
  }
  return date;
};

const addOneWorkday = (date) => {
  date.setDate(date.getDate() + 1);
  return moveToNextWorkday(date);
};

// ==========================================
// COURSES
// ==========================================

export const createCourse = asyncHandler(async (req, res) => {
  const { name, description, track, duration_months, capacity, status, instructor_id, employee_id } = req.body;

  if (!name || !track || !duration_months || !capacity) {
    throw new ApiError(400, "Please provide name, track, duration_months, and capacity");
  }

  let thumbnailUrl = thumbnail_url || null;
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult?.url) thumbnailUrl = uploadResult.url;
  }

  const { data, error } = await supabase
    .from("courses")
    .insert([{ name, description, track, duration_months, capacity, status: status || 'DRAFT', thumbnail_url: thumbnailUrl }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to create course");

  const assignedInstructorId = instructor_id || employee_id;
  if (assignedInstructorId) {
    const { error: instructorError } = await supabase
      .from("course_instructors")
      .insert([{ course_id: data[0].id, employee_id: assignedInstructorId }]);

    if (instructorError) {
      await supabase.from("courses").delete().eq("id", data[0].id);
      throw new ApiError(500, instructorError.message || "Failed to assign course instructor");
    }
  }

  return res.status(201).json(new ApiResponse(201, data[0], "Course created successfully"));
});

export const getCourses = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("courses")
    .select(`*, student_courses(count), course_instructors(employee_profiles(id, first_name, last_name))`);

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
    .select(`*, course_modules(*, course_submodules(*, course_tasks(*))), course_schedules(*), course_instructors(employee_profiles(*)), student_courses(count)`)
    .eq("id", courseId)
    .single();

  if (error) throw new ApiError(404, "Course not found");

  data.enrollment_count = parseInt(data.student_courses[0]?.count || "0", 10);

  return res.status(200).json(new ApiResponse(200, data, "Course fetched successfully"));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { name, description, track, duration_months, capacity, status, instructor_id, employee_id, thumbnail_url } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (track !== undefined) updates.track = track;
  if (duration_months !== undefined) updates.duration_months = duration_months;
  if (capacity !== undefined) updates.capacity = capacity;
  if (status !== undefined) updates.status = status;
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url;

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult?.url) {
      updates.thumbnail_url = uploadResult.url;

      const { data: oldCourse } = await supabase.from("courses").select("thumbnail_url").eq("id", courseId).single();
      if (oldCourse?.thumbnail_url) {
        const publicId = extractPublicIdFromUrl(oldCourse.thumbnail_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    }
  }

  const { data, error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", courseId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update course");
  if (!data || data.length === 0) throw new ApiError(404, "Course not found");

  const assignedInstructorId = instructor_id || employee_id;
  if (assignedInstructorId !== undefined) {
    await supabase.from("course_instructors").delete().eq("course_id", courseId);

    if (assignedInstructorId) {
      const { error: instructorError } = await supabase
        .from("course_instructors")
        .insert([{ course_id: courseId, employee_id: assignedInstructorId }]);

      if (instructorError) throw new ApiError(500, instructorError.message || "Failed to update course instructor");
    }
  }

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

export const addCourseSubmodule = asyncHandler(async (req, res) => {
  const { courseId, moduleId } = req.params;
  const { title, description, sequence_order } = req.body;

  if (!title || sequence_order === undefined || !Number.isInteger(sequence_order) || sequence_order < 0) {
    throw new ApiError(400, "Please provide title and a non-negative integer for sequence_order");
  }

  const { data, error } = await supabase
    .from("course_submodules")
    .insert([{ module_id: moduleId, title, description, sequence_order }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to add course submodule");
  return res.status(201).json(new ApiResponse(201, data[0], "Course submodule added successfully"));
});

export const updateCourseSubmodule = asyncHandler(async (req, res) => {
  const { courseId, moduleId, submoduleId } = req.params;
  const { title, description, sequence_order, scheduled_date } = req.body;

  if (scheduled_date !== undefined && scheduled_date) {
    const targetDate = parseDateOnly(scheduled_date);
    if (isWeekend(targetDate)) {
      throw new ApiError(400, "Topics can only be scheduled from Monday to Friday");
    }
  }

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (sequence_order !== undefined) updates.sequence_order = sequence_order;
  if (scheduled_date !== undefined) updates.scheduled_date = scheduled_date;

  const { data, error } = await supabase
    .from("course_submodules")
    .update(updates)
    .eq("id", submoduleId)
    .eq("module_id", moduleId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update course submodule");
  if (!data || data.length === 0) throw new ApiError(404, "Course submodule not found");
  return res.status(200).json(new ApiResponse(200, data[0], "Course submodule updated successfully"));
});

export const deleteCourseSubmodule = asyncHandler(async (req, res) => {
  const { courseId, moduleId, submoduleId } = req.params;
  const { data, error } = await supabase
    .from("course_submodules")
    .delete()
    .eq("id", submoduleId)
    .eq("module_id", moduleId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete course submodule");
  if (!data || data.length === 0) throw new ApiError(404, "Course submodule not found");
  return res.status(200).json(new ApiResponse(200, {}, "Course submodule deleted successfully"));
});

export const addCourseTask = asyncHandler(async (req, res) => {
  const { courseId, moduleId, submoduleId } = req.params;
  const { title, description, sequence_order, task_type, due_date } = req.body;

  if (!title || sequence_order === undefined || !Number.isInteger(sequence_order) || sequence_order < 0) {
    throw new ApiError(400, "Please provide title and a non-negative integer for sequence_order");
  }

  const { data, error } = await supabase
    .from("course_tasks")
    .insert([{ submodule_id: submoduleId, title, description, sequence_order, task_type: task_type || 'PRE_PLANNED', due_date }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to add course task");
  return res.status(201).json(new ApiResponse(201, data[0], "Course task added successfully"));
});

export const updateCourseTask = asyncHandler(async (req, res) => {
  const { courseId, moduleId, submoduleId, taskId } = req.params;
  const { title, description, sequence_order, task_type, due_date } = req.body;

  const updates = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (sequence_order !== undefined) updates.sequence_order = sequence_order;
  if (task_type !== undefined) updates.task_type = task_type;
  if (due_date !== undefined) updates.due_date = due_date;

  const { data, error } = await supabase
    .from("course_tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("submodule_id", submoduleId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to update course task");
  if (!data || data.length === 0) throw new ApiError(404, "Course task not found");
  return res.status(200).json(new ApiResponse(200, data[0], "Course task updated successfully"));
});

export const deleteCourseTask = asyncHandler(async (req, res) => {
  const { courseId, moduleId, submoduleId, taskId } = req.params;
  const { data, error } = await supabase
    .from("course_tasks")
    .delete()
    .eq("id", taskId)
    .eq("submodule_id", submoduleId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete course task");
  if (!data || data.length === 0) throw new ApiError(404, "Course task not found");
  return res.status(200).json(new ApiResponse(200, {}, "Course task deleted successfully"));
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

export const autoSchedulePlan = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const requestedTopicsPerDay = Number(req.body?.topics_per_day);
  const topicsPerDay = Number.isInteger(requestedTopicsPerDay)
    ? Math.min(MAX_TOPICS_PER_DAY, Math.max(MIN_TOPICS_PER_DAY, requestedTopicsPerDay))
    : DEFAULT_TOPICS_PER_DAY;

  // 1. Get course schedule to find the start date.
  const { data: scheduleData, error: scheduleError } = await supabase
    .from("course_schedules")
    .select("*")
    .eq("course_id", courseId)
    .order('start_date', { ascending: true })
    .limit(1);

  if (scheduleError) throw new ApiError(500, scheduleError.message || "Failed to fetch course schedules");
  
  let startDate = parseDateOnly();
  if (scheduleData && scheduleData.length > 0) {
    startDate = parseDateOnly(scheduleData[0].start_date);
  }

  // 2. Fetch all submodules ordered by sequence
  const { data: submodules, error: subError } = await supabase
    .from("course_submodules")
    .select("*, course_modules!inner(course_id, sequence_order)")
    .eq("course_modules.course_id", courseId)
    .order("sequence_order", { ascending: true, foreignTable: "course_modules" })
    .order("sequence_order", { ascending: true });

  if (subError) throw new ApiError(500, subError.message || "Failed to fetch submodules");

  if (!submodules || submodules.length === 0) {
    return res.status(200).json(new ApiResponse(200, {}, "No submodules to schedule"));
  }

  // 3. Assign 2-3 topics per valid teaching day, Monday-Friday only.
  let currentDate = moveToNextWorkday(new Date(startDate));
  let submodulesAssignedToday = 0;
  const updates = [];

  for (const sub of submodules) {
    moveToNextWorkday(currentDate);

    updates.push({
      id: sub.id,
      module_id: sub.module_id,
      title: sub.title,
      description: sub.description,
      sequence_order: sub.sequence_order,
      scheduled_date: toDateOnlyString(currentDate)
    });

    submodulesAssignedToday++;
    if (submodulesAssignedToday >= topicsPerDay) {
      submodulesAssignedToday = 0;
      addOneWorkday(currentDate);
    }
  }

  // Bulk update (Supabase allows bulk upsert, we can upsert with id)
  const { data: updateData, error: updateError } = await supabase
    .from("course_submodules")
    .upsert(updates)
    .select();

  if (updateError) throw new ApiError(500, updateError.message || "Failed to save schedule");

  return res.status(200).json(new ApiResponse(200, updateData, "Schedule generated successfully"));
});

export const previewAutoSchedule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const requestedTopicsPerDay = Number(req.body?.topics_per_day);
  const topicsPerDay = Number.isInteger(requestedTopicsPerDay)
    ? Math.min(MAX_TOPICS_PER_DAY, Math.max(MIN_TOPICS_PER_DAY, requestedTopicsPerDay))
    : DEFAULT_TOPICS_PER_DAY;

  // 1. Get course schedule to find the start date.
  const { data: scheduleData, error: scheduleError } = await supabase
    .from("course_schedules")
    .select("*")
    .eq("course_id", courseId)
    .order('start_date', { ascending: true })
    .limit(1);

  if (scheduleError) throw new ApiError(500, scheduleError.message || "Failed to fetch course schedules");

  let startDate = parseDateOnly();
  if (scheduleData && scheduleData.length > 0) {
    startDate = parseDateOnly(scheduleData[0].start_date);
  }

  // 2. Fetch all submodules ordered by sequence
  const { data: submodules, error: subError } = await supabase
    .from("course_submodules")
    .select("*, course_modules!inner(course_id, sequence_order, title)")
    .eq("course_modules.course_id", courseId)
    .order("sequence_order", { ascending: true, foreignTable: "course_modules" })
    .order("sequence_order", { ascending: true });

  if (subError) throw new ApiError(500, subError.message || "Failed to fetch submodules");

  if (!submodules || submodules.length === 0) {
    return res.status(200).json(new ApiResponse(200, {
      topics_per_day: topicsPerDay,
      total_topics: 0,
      total_days: 0,
      start_date: null,
      end_date: null,
      days: []
    }, "No submodules to schedule"));
  }

  // 3. Build day-by-day breakdown (same logic as autoSchedulePlan, but no DB write)
  let currentDate = moveToNextWorkday(new Date(startDate));
  let submodulesAssignedToday = 0;
  const dayMap = new Map(); // dateString -> array of topics

  for (const sub of submodules) {
    moveToNextWorkday(currentDate);
    const dateStr = toDateOnlyString(currentDate);

    if (!dayMap.has(dateStr)) {
      dayMap.set(dateStr, []);
    }

    dayMap.get(dateStr).push({
      id: sub.id,
      title: sub.title,
      sequence_order: sub.sequence_order,
      module_title: sub.course_modules?.title || '',
      module_sequence: sub.course_modules?.sequence_order || 0
    });

    submodulesAssignedToday++;
    if (submodulesAssignedToday >= topicsPerDay) {
      submodulesAssignedToday = 0;
      addOneWorkday(currentDate);
    }
  }

  // 4. Convert map to sorted array of days
  const days = [];
  for (const [dateStr, topics] of dayMap) {
    const dateObj = parseDateOnly(dateStr);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    days.push({
      date: dateStr,
      weekday,
      topics
    });
  }

  const allDates = days.map(d => d.date).sort();

  return res.status(200).json(new ApiResponse(200, {
    topics_per_day: topicsPerDay,
    total_topics: submodules.length,
    total_days: days.length,
    start_date: allDates[0] || null,
    end_date: allDates[allDates.length - 1] || null,
    days
  }, "Schedule preview generated successfully"));
});

export const reschedulePlan = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { holiday_date } = req.body;

  if (!holiday_date) throw new ApiError(400, "Please provide holiday_date");

  // Fetch submodules from holiday_date onwards
  const { data: submodules, error: subError } = await supabase
    .from("course_submodules")
    .select("*, course_modules!inner(course_id)")
    .eq("course_modules.course_id", courseId)
    .gte("scheduled_date", holiday_date)
    .order("scheduled_date", { ascending: true })
    .order("sequence_order", { ascending: true });

  if (subError) throw new ApiError(500, subError.message || "Failed to fetch submodules");

  if (!submodules || submodules.length === 0) {
    return res.status(200).json(new ApiResponse(200, {}, "No submodules scheduled on or after this date"));
  }

  // Shift the holiday date and every later scheduled day to the next workday.
  const oldToNewDates = {};
  let currentValidDate = addOneWorkday(parseDateOnly(holiday_date));

  let lastOldDate = null;
  
  for (const sub of submodules) {
    const oldDateStr = sub.scheduled_date;
    if (oldDateStr !== lastOldDate) {
      if (lastOldDate !== null) {
        addOneWorkday(currentValidDate);
      }
      oldToNewDates[oldDateStr] = toDateOnlyString(currentValidDate);
      lastOldDate = oldDateStr;
    }
  }

  const finalUpdates = submodules.map(sub => ({
    id: sub.id,
    module_id: sub.module_id,
    title: sub.title,
    description: sub.description,
    sequence_order: sub.sequence_order,
    scheduled_date: oldToNewDates[sub.scheduled_date]
  }));

  const { data: updateData, error: updateError } = await supabase
    .from("course_submodules")
    .upsert(finalUpdates)
    .select();

  if (updateError) throw new ApiError(500, updateError.message || "Failed to reschedule plan");

  return res.status(200).json(new ApiResponse(200, updateData, "Plan rescheduled successfully"));
});

export const getAdminDailyPlan = asyncHandler(async (req, res) => {
  const { date } = req.query;

  if (!date) throw new ApiError(400, "Please provide a date query parameter");

  // Fetch all submodules scheduled on the given date across all courses
  const { data, error } = await supabase
    .from("course_submodules")
    .select(`
      *,
      course_modules!inner(
        course_id, 
        title, 
        courses(name)
      ),
      course_tasks(*)
    `)
    .eq("scheduled_date", date)
    .order("sequence_order", { ascending: true });

  if (error) throw new ApiError(500, error.message || "Failed to fetch admin daily plan");

  return res.status(200).json(new ApiResponse(200, data, "Admin daily plan fetched successfully"));
});
