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
    id, report_type, work_done, blockers, submitted_at, approval_status,
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
  if (status) {
    const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    if (!validStatuses.includes(status.toUpperCase())) {
      throw new ApiError(400, "status filter must be PENDING, APPROVED, or REJECTED");
    }
    query = query.eq("approval_status", status.toUpperCase());
  }
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
    id, report_type, work_done, blockers, submitted_at, approval_status,
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

// @desc    Approve a work report
// @route   PATCH /api/v1/work-reports/:reportId/approve
export const approveReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const { data: existing } = await supabase.from("work_reports").select("approval_status").eq("id", reportId).single();
  if (!existing) throw new ApiError(404, "Report not found");
  if (existing.approval_status === "APPROVED") throw new ApiError(409, "Report is already approved");

  const reviewer_id = await getEmployeeId(req.user.id);

  const { data, error } = await supabase
    .from("work_reports")
    .update({ approval_status: "APPROVED", reviewed_by: reviewer_id })
    .eq("id", reportId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to approve report");
  if (!data || data.length === 0) throw new ApiError(404, "Report not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Work report approved successfully"));
});

// @desc    Reject a work report
// @route   PATCH /api/v1/work-reports/:reportId/reject
export const rejectReport = asyncHandler(async (req, res) => {
  const { reportId } = req.params;

  const { data: existing } = await supabase.from("work_reports").select("approval_status").eq("id", reportId).single();
  if (!existing) throw new ApiError(404, "Report not found");
  if (existing.approval_status === "REJECTED") throw new ApiError(409, "Report is already rejected");

  const reviewer_id = await getEmployeeId(req.user.id);

  const { data, error } = await supabase
    .from("work_reports")
    .update({ approval_status: "REJECTED", reviewed_by: reviewer_id })
    .eq("id", reportId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to reject report");
  if (!data || data.length === 0) throw new ApiError(404, "Report not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Work report rejected successfully"));
});
