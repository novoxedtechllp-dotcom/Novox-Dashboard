import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper function to resolve the target table and logical ID based on a generic userId
const resolveUserEntity = async (userId, explicitType) => {
  // If explicitType is provided by frontend (student/employee)
  if (explicitType === 'student') return { table: 'student_attendance', column: 'student_id', id: userId };
  if (explicitType === 'employee') return { table: 'employee_attendance', column: 'employee_id', id: userId };

  // Attempt to resolve by assuming userId is the UUID from the `users` table
  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single();
  
  if (user) {
    if (user.role === 'STUDENT') {
      const { data: student } = await supabase.from("students").select("id").eq("user_id", userId).single();
      if (!student) throw new ApiError(404, "Student profile not found for this user");
      return { table: 'student_attendance', column: 'student_id', id: student.id };
    } else {
      const { data: employee } = await supabase.from("employee_profiles").select("id").eq("user_id", userId).single();
      if (!employee) throw new ApiError(404, "Employee profile not found for this user");
      return { table: 'employee_attendance', column: 'employee_id', id: employee.id };
    }
  }

  // Fallback: Check if it's a raw student_id
  const { data: isStudent } = await supabase.from("students").select("id").eq("id", userId).single();
  if (isStudent) return { table: 'student_attendance', column: 'student_id', id: userId };

  // Fallback: Check if it's a raw employee_id
  const { data: isEmployee } = await supabase.from("employee_profiles").select("id").eq("id", userId).single();
  if (isEmployee) return { table: 'employee_attendance', column: 'employee_id', id: userId };

  throw new ApiError(404, "Could not resolve user entity from provided userId");
};

// @desc    Mark Attendance
// @route   POST /api/v1/attendance
export const markAttendance = asyncHandler(async (req, res) => {
  const { userId, date, status, check_in, check_out, remarks, type } = req.body;

  if (!userId || !date || !status) {
    throw new ApiError(400, "userId, date, and status are required");
  }

  const { table, column, id } = await resolveUserEntity(userId, type);
  const formattedStatus = status.toUpperCase();

  const payload = {
    [column]: id,
    attendance_date: date,
    status: formattedStatus,
  };

  if (check_in) payload.check_in = check_in;
  if (check_out) payload.check_out = check_out;
  if (remarks) payload.remarks = remarks;

  // Use upsert to handle UNIQUE(student_id/employee_id, attendance_date) gracefully
  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: `${column},attendance_date` })
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to mark attendance");

  return res.status(200).json(new ApiResponse(200, data[0], "Attendance marked successfully"));
});

// @desc    Bulk Mark Attendance
// @route   POST /api/v1/attendance/bulk
export const bulkAttendance = asyncHandler(async (req, res) => {
  const { records, type } = req.body; // type = 'student' or 'employee'

  if (!records || !Array.isArray(records) || records.length === 0) {
    throw new ApiError(400, "Please provide an array of attendance records");
  }
  if (!type) {
    throw new ApiError(400, "Please provide a 'type' (student or employee) for bulk attendance");
  }

  const table = type === 'student' ? 'student_attendance' : 'employee_attendance';
  const column = type === 'student' ? 'student_id' : 'employee_id';

  const payloads = [];
  for (const record of records) {
    if (!record.userId || !record.date || !record.status) {
      throw new ApiError(400, "All records must contain userId, date, and status");
    }
    const payload = {
      [column]: record.userId, // For bulk, we assume raw student_id/employee_id for performance
      attendance_date: record.date,
      status: record.status.toUpperCase()
    };
    if (record.check_in) payload.check_in = record.check_in;
    if (record.check_out) payload.check_out = record.check_out;
    if (record.remarks) payload.remarks = record.remarks;
    payloads.push(payload);
  }

  const { data, error } = await supabase
    .from(table)
    .upsert(payloads, { onConflict: `${column},attendance_date` })
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to mark bulk attendance");

  return res.status(200).json(new ApiResponse(200, data, "Bulk attendance marked successfully"));
});

// @desc    Get Attendance History
// @route   GET /api/v1/attendance
export const getAttendanceHistory = asyncHandler(async (req, res) => {
  let { userId, from, to, type } = req.query;

  // If the requester is a STUDENT, force userId to be their own
  if (req.user.role === 'STUDENT') {
    if (userId && userId !== req.user.id) {
      throw new ApiError(403, "You can only view your own attendance");
    }
    userId = req.user.id;
    type = 'student';
  }

  if (!type && !userId) {
    throw new ApiError(400, "Please provide either 'userId' or 'type' (student/employee) to fetch history");
  }

  let table = type === 'student' ? 'student_attendance' : 'employee_attendance';
  let filterColumn = type === 'student' ? 'student_id' : 'employee_id';

  let resolvedId = userId;

  if (userId) {
    const entity = await resolveUserEntity(userId, type);
    table = entity.table;
    filterColumn = entity.column;
    resolvedId = entity.id;
  }

  let query = supabase.from(table).select("*").order("attendance_date", { ascending: false });

  if (resolvedId) {
    query = query.eq(filterColumn, resolvedId);
  }
  if (from) {
    query = query.gte("attendance_date", from);
  }
  if (to) {
    query = query.lte("attendance_date", to);
  }

  const { data, error } = await query;

  if (error) throw new ApiError(500, error.message || "Failed to fetch attendance history");

  return res.status(200).json(new ApiResponse(200, data, "Attendance history fetched successfully"));
});

// @desc    Get Attendance Reports
// @route   GET /api/v1/attendance/reports
export const getAttendanceReport = asyncHandler(async (req, res) => {
  const { date, type } = req.query; // optional filters
  const reportDate = date || new Date().toISOString().split('T')[0];

  const getStats = async (table) => {
    const query = supabase.from(table).select("status", { count: "exact" }).eq("attendance_date", reportDate);
    const { data, error } = await query;
    if (error) return { PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0 };
    
    return data.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, { PRESENT: 0, ABSENT: 0, LATE: 0, HALF_DAY: 0 });
  };

  let report = { date: reportDate };

  if (!type || type === 'student') {
    report.students = await getStats('student_attendance');
  }
  
  if (!type || type === 'employee') {
    report.employees = await getStats('employee_attendance');
  }

  return res.status(200).json(new ApiResponse(200, report, "Attendance report fetched successfully"));
});
