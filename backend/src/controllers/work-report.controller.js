import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper to get employee_id from req.user.id
const getEmployeeId = async (userId) => {
  const { data, error } = await supabase.from("employee_profiles").select("id").eq("user_id", userId).single();
  if (error || !data) throw new ApiError(404, "Employee profile not found for this user");
  return data.id;
};

// @desc    Submit a work report
// @route   POST /api/v1/work-reports
export const submitReport = asyncHandler(async (req, res) => {
  const { project_id, report_type, work_done, blockers } = req.body;
  
  if (!project_id || !report_type || !work_done) {
    throw new ApiError(400, "project_id, report_type, and work_done are required");
  }

  const validTypes = ["DAILY", "WEEKLY"];
  if (!validTypes.includes(report_type.toUpperCase())) {
    throw new ApiError(400, "report_type must be DAILY or WEEKLY");
  }

  const employee_id = await getEmployeeId(req.user.id);

  const { data, error } = await supabase
    .from("work_reports")
    .insert([{ employee_id, project_id, report_type: report_type.toUpperCase(), work_done, blockers }])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to submit report");

  return res.status(201).json(new ApiResponse(201, data[0], "Work report submitted successfully"));
});

// @desc    Get work reports (Admin/HR gets all, Employee gets own)
// @route   GET /api/v1/work-reports
export const getReports = asyncHandler(async (req, res) => {
  const { projectId, employeeId, status, from, to } = req.query;

  let query = supabase.from("work_reports").select(`
    id, report_type, work_done, blockers, submitted_at,
    projects(id, name),
    employee:employee_profiles!employee_id(id, first_name, last_name, employee_code),
    reviewer:employee_profiles!reviewed_by(id, first_name, last_name)
  `).order("submitted_at", { ascending: false });

  if (req.user.role === "EMPLOYEE" && req.user.employeeRole !== "HR") {
    // Regular employee can only see their own
    const empId = await getEmployeeId(req.user.id);
    query = query.eq("employee_id", empId);
  } else if (employeeId) {
    // Admin/HR filtering by employee
    query = query.eq("employee_id", employeeId);
  }

  if (projectId) query = query.eq("project_id", projectId);
  if (from) query = query.gte("submitted_at", from);
  if (to) query = query.lte("submitted_at", to);

  const { data, error } = await query;
  if (error) throw new ApiError(500, error.message || "Failed to fetch work reports");

  return res.status(200).json(new ApiResponse(200, data, "Work reports fetched successfully"));
});

// @desc    Get single work report
// @route   GET /api/v1/work-reports/:reportId
export const getReportById = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const { data, error } = await supabase.from("work_reports").select(`
    id, report_type, work_done, blockers, submitted_at,
    projects(id, name, description),
    employee:employee_profiles!employee_id(id, first_name, last_name, employee_code, designation),
    reviewer:employee_profiles!reviewed_by(id, first_name, last_name)
  `).eq("id", reportId).single();

  if (error) throw new ApiError(404, "Work report not found");

  if (req.user.role === "EMPLOYEE" && req.user.employeeRole !== "HR") {
    const empId = await getEmployeeId(req.user.id);
    if (data.employee.id !== empId) {
      throw new ApiError(403, "You can only view your own work reports");
    }
  }

  return res.status(200).json(new ApiResponse(200, data, "Work report fetched successfully"));
});


