import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper function to resolve the target employee profile ID
const resolveEmployeeProfileId = async (userId) => {
  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single();
  
  if (user && user.role === 'EMPLOYEE') {
    const { data: employee } = await supabase.from("employee_profiles").select("id").eq("user_id", userId).single();
    if (!employee) throw new ApiError(404, "Employee profile not found for this user");
    return employee.id;
  }

  // Fallback: Check if it's a raw employee_id
  const { data: isEmployee } = await supabase.from("employee_profiles").select("id").eq("id", userId).single();
  if (isEmployee) return userId;

  throw new ApiError(403, "Only employees can request leaves");
};

// @desc    Create a leave request
// @route   POST /api/v1/leaves
export const createLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason } = req.body;
  const userId = req.user.id;

  if (!leaveType || !startDate || !endDate || !reason) {
    throw new ApiError(400, "All fields are required");
  }

  const employeeId = await resolveEmployeeProfileId(userId);

  const payload = {
    employee_id: employeeId,
    type: leaveType,
    start_date: startDate,
    end_date: endDate,
    reason: reason,
    status: 'PENDING'
  };

  const { data, error } = await supabase
    .from('leaves')
    .insert([payload])
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to submit leave request");

  return res.status(201).json(new ApiResponse(201, data[0], "Leave request submitted successfully"));
});

// @desc    Get leave requests
// @route   GET /api/v1/leaves
export const getLeaves = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  let query = supabase.from('leaves').select('*, employee_profiles(first_name, last_name, designation, avatar_url)').order('applied_on', { ascending: false });

  if (role === 'EMPLOYEE') {
    const employeeId = await resolveEmployeeProfileId(userId);
    query = query.eq('employee_id', employeeId);
  } else if (role !== 'ADMIN') {
    throw new ApiError(403, "Unauthorized to view leave requests");
  }

  const { data, error } = await query;

  if (error) throw new ApiError(500, error.message || "Failed to fetch leave requests");

  return res.status(200).json(new ApiResponse(200, data, "Leave requests fetched successfully"));
});

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/v1/leaves/:id/status
export const updateLeaveStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminMessage } = req.body;
  const role = req.user.role;

  if (role !== 'ADMIN') {
    throw new ApiError(403, "Only admins can approve or reject leaves");
  }

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const payload = { status };
  if (adminMessage) {
    payload.admin_message = adminMessage;
  }

  const { data, error } = await supabase
    .from('leaves')
    .update(payload)
    .eq('id', id)
    .select('*, employee_profiles(first_name, last_name, designation, avatar_url)');

  if (error) throw new ApiError(500, error.message || "Failed to update leave status");
  if (!data || data.length === 0) throw new ApiError(404, "Leave request not found");

  return res.status(200).json(new ApiResponse(200, data[0], \`Leave request \${status.toLowerCase()} successfully\`));
});
