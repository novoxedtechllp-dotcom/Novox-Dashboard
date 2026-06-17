import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper function to resolve the target profile ID
const resolveProfileId = async (userId) => {
  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single();
  
  if (user && user.role === 'EMPLOYEE') {
    const { data: employee } = await supabase.from("employee_profiles").select("id, role_id").eq("user_id", userId).single();
    if (!employee) throw new ApiError(404, "Employee profile not found for this user");
    return { type: 'EMPLOYEE', id: employee.id, role_id: employee.role_id };
  }

  if (user && user.role === 'STUDENT') {
    const { data: student } = await supabase.from("students").select("id").eq("user_id", userId).single();
    if (!student) throw new ApiError(404, "Student profile not found for this user");
    return { type: 'STUDENT', id: student.id };
  }

  // Fallback: Check if it's a raw employee_id
  const { data: isEmployee } = await supabase.from("employee_profiles").select("id").eq("id", userId).single();
  if (isEmployee) return { type: 'EMPLOYEE', id: userId };

  throw new ApiError(403, "Only employees and students can request leaves");
};

// @desc    Create a leave request
// @route   POST /api/v1/leaves
export const createLeave = asyncHandler(async (req, res) => {
  const { leaveType, startDate, endDate, reason, documentUrl } = req.body;
  const userId = req.user.id;

  if (!leaveType || !startDate || !endDate || !reason) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const profile = await resolveProfileId(userId);

  const payload = {
    type: leaveType,
    start_date: startDate,
    end_date: endDate,
    reason: reason,
    document_url: documentUrl || null,
    status: 'PENDING'
  };

  if (profile.type === 'EMPLOYEE') payload.employee_id = profile.id;
  if (profile.type === 'STUDENT') payload.student_id = profile.id;

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

  let query = supabase.from('leaves')
    .select('*, employee_profiles(first_name, last_name, designation, avatar_url), students(first_name, last_name, student_code, avatar_url)')
    .order('applied_on', { ascending: false });

  if (role === 'ADMIN') {
    // Admin only sees employee leaves
    query = query.is('student_id', null);
  } else if (role === 'STUDENT') {
    const profile = await resolveProfileId(userId);
    query = query.eq('student_id', profile.id);
  } else if (role === 'EMPLOYEE') {
    const profile = await resolveProfileId(userId);
    
    // Check if HR
    const { data: empRole } = await supabase
      .from('employee_roles')
      .select('role_name')
      .eq('id', profile.role_id)
      .single();
      
    const isHR = empRole && empRole.role_name === 'HR';
    
    const { data: coursesTaught } = await supabase
      .from('course_instructors')
      .select('course_id')
      .eq('employee_id', profile.id);
    
    const courseIds = (coursesTaught || []).map(c => c.course_id);
    
    let studentIdsToFetch = [];
    if (courseIds.length > 0) {
      const { data: studentsEnrolled } = await supabase
        .from('student_courses')
        .select('student_id')
        .in('course_id', courseIds);
      studentIdsToFetch = (studentsEnrolled || []).map(s => s.student_id);
    }
    
    if (isHR) {
      if (studentIdsToFetch.length > 0) {
        query = query.or(`student_id.is.null,student_id.in.(${studentIdsToFetch.join(',')})`);
      } else {
        query = query.is('student_id', null);
      }
    } else {
      if (studentIdsToFetch.length > 0) {
        query = query.or(`employee_id.eq.${profile.id},student_id.in.(${studentIdsToFetch.join(',')})`);
      } else {
        query = query.eq('employee_id', profile.id);
      }
    }
  } else {
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
  const userId = req.user.id;

  if (role !== 'ADMIN' && role !== 'EMPLOYEE') {
    throw new ApiError(403, "Only admins, HR, and mentors can approve or reject leaves");
  }

  // Strict Authorization
  if (role === 'EMPLOYEE') {
    const profile = await resolveProfileId(userId);
    const { data: leave } = await supabase.from('leaves').select('employee_id, student_id').eq('id', id).single();
    
    if (!leave) throw new ApiError(404, "Leave request not found");

    if (leave.employee_id === profile.id) {
      throw new ApiError(403, "You cannot approve or reject your own leave requests");
    }

    const { data: empRole } = await supabase.from('employee_roles').select('role_name').eq('id', profile.role_id).single();
    const isHR = empRole && empRole.role_name === 'HR';

    if (leave.employee_id && !isHR) {
      throw new ApiError(403, "Only HR or Admin can approve employee leave requests");
    }

    if (leave.student_id && !isHR) {
      // Check if this employee teaches this student
      const { data: coursesTaught } = await supabase.from('course_instructors').select('course_id').eq('employee_id', profile.id);
      const courseIds = (coursesTaught || []).map(c => c.course_id);
      
      let isTeacher = false;
      if (courseIds.length > 0) {
        const { data: studentsEnrolled } = await supabase.from('student_courses').select('student_id').in('course_id', courseIds).eq('student_id', leave.student_id);
        if (studentsEnrolled && studentsEnrolled.length > 0) isTeacher = true;
      }

      if (!isTeacher) {
        throw new ApiError(403, "You can only approve leaves for your enrolled students");
      }
    }
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
    .select('*, employee_profiles(first_name, last_name, designation, avatar_url), students(first_name, last_name, student_code, avatar_url)');

  if (error) throw new ApiError(500, error.message || "Failed to update leave status");
  if (!data || data.length === 0) throw new ApiError(404, "Leave request not found");

  return res.status(200).json(new ApiResponse(200, data[0], `Leave request ${status.toLowerCase()} successfully`));
});

// @desc    Delete a leave request
// @route   DELETE /api/v1/leaves/:id
export const deleteLeave = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  const { data: leave, error: fetchError } = await supabase
    .from('leaves')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !leave) throw new ApiError(404, "Leave request not found");

  if (role !== 'ADMIN') {
    const profile = await resolveProfileId(userId);
    if (profile.type === 'EMPLOYEE' && leave.employee_id !== profile.id) {
      throw new ApiError(403, "You can only delete your own leave requests");
    }
    if (profile.type === 'STUDENT' && leave.student_id !== profile.id) {
      throw new ApiError(403, "You can only delete your own leave requests");
    }
  }

  if (leave.status !== 'PENDING' && role !== 'ADMIN') {
    throw new ApiError(400, "Cannot delete a leave request that has already been processed");
  }

  const { error: deleteError } = await supabase
    .from('leaves')
    .delete()
    .eq('id', id);

  if (deleteError) throw new ApiError(500, deleteError.message || "Failed to delete leave request");

  return res.status(200).json(new ApiResponse(200, {}, "Leave request deleted successfully"));
});
