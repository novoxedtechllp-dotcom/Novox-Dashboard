import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc    Get a student's full academic journey timeline
// @route   GET /api/v1/students/:studentId/academic-journey
const getAcademicJourney = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const requestingUser = req.user;

  // RBAC
  if (requestingUser.role === "STUDENT") {
    const { data: profile } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", requestingUser.id)
      .single();

    if (!profile || profile.id !== studentId) {
      throw new ApiError(403, "Students can only view their own academic journey");
    }
  }

  if (requestingUser.role === "EMPLOYEE") {
    const { data: empProfile } = await supabase
      .from("employee_profiles")
      .select("id")
      .eq("user_id", requestingUser.id)
      .single();

    if (!empProfile) throw new ApiError(403, "Employee profile not found");

    const { data: assignedCourses } = await supabase
      .from("course_instructors")
      .select("course_id")
      .eq("employee_id", empProfile.id);

    const courseIds = (assignedCourses || []).map(c => c.course_id);

    const { data: enrollment } = await supabase
      .from("student_courses")
      .select("id")
      .eq("student_id", studentId)
      .in("course_id", courseIds);

    if (!enrollment || enrollment.length === 0) {
      throw new ApiError(403, "You are not assigned to any course this student is enrolled in");
    }
  }

  // Parallel fetches
  const [tasksRes, attendanceRes, enrollmentsRes] = await Promise.all([
    supabase
      .from("student_tasks")
      .select(`
        id, status, submitted_at, review_timestamp, review_comment,
        course_tasks(title),
        employee_profiles!reviewer_id(first_name, last_name)
      `)
      .eq("student_id", studentId)
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: true }),

    supabase
      .from("student_attendance")
      .select("attendance_date, status, check_in, check_out, remarks")
      .eq("student_id", studentId)
      .order("attendance_date", { ascending: true }),

    supabase
      .from("student_courses")
      .select(`
        course_id, enrolled_at, progress_percentage, completion_status,
        courses(name, track)
      `)
      .eq("student_id", studentId),
  ]);

  if (tasksRes.error) throw new ApiError(500, tasksRes.error.message);
  if (attendanceRes.error) throw new ApiError(500, attendanceRes.error.message);
  if (enrollmentsRes.error) throw new ApiError(500, enrollmentsRes.error.message);

  // Build timeline
  const events = [];

  for (const t of tasksRes.data || []) {
    if (t.submitted_at) {
      events.push({
        type: "TASK_SUBMITTED",
        date: t.submitted_at,
        title: `Submitted: ${t.course_tasks?.title ?? "Unknown Task"}`,
        meta: {},
      });
    }

    if (t.review_timestamp) {
      const reviewerName = t.employee_profiles
        ? `${t.employee_profiles.first_name} ${t.employee_profiles.last_name}`
        : "Admin";

      events.push({
        type: t.status === "APPROVED" ? "TASK_APPROVED" : "TASK_CHANGES_REQUESTED",
        date: t.review_timestamp,
        title: `${t.status === "APPROVED" ? "Approved" : "Changes Requested"}: ${t.course_tasks?.title ?? "Unknown Task"}`,
        meta: {
          reviewerName,
          comment: t.review_comment || null,
        },
      });
    }
  }

  for (const a of attendanceRes.data || []) {
    events.push({
      type: "ATTENDANCE",
      date: a.attendance_date,
      title: `Attendance: ${a.status}`,
      meta: {
        checkIn: a.check_in,
        checkOut: a.check_out,
        remarks: a.remarks,
      },
    });
  }

  for (const e of enrollmentsRes.data || []) {
    events.push({
      type: "ENROLLMENT",
      date: e.enrolled_at,
      title: `Enrolled in ${e.courses?.name ?? "Unknown Course"}`,
      meta: {
        track: e.courses?.track,
        progress: e.progress_percentage,
      },
    });
  }

  events.sort((a, b) => new Date(a.date) - new Date(b.date));

  const progressGraph = (enrollmentsRes.data || []).map(e => ({
    courseName: e.courses?.name,
    track: e.courses?.track,
    progressPercentage: e.progress_percentage,
    completionStatus: e.completion_status,
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      timeline: events,
      attendanceSummary: attendanceRes.data,
      enrollments: enrollmentsRes.data,
      progressGraph,
    }, "Academic journey fetched successfully")
  );
});

export { getAcademicJourney };
