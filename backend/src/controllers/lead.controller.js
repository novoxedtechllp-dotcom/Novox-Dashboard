import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
};

// @desc    Get all leads
// @route   GET /api/v1/leads
export const getLeads = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("leads")
    .select(`
      id, name, phone, email, source_id, interested_course_id, assigned_sales_id, stage, created_at, owner, is_hot, note,
      lead_sources ( source_name ),
      courses ( name ),
      employee_profiles ( first_name, last_name )
    `)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(500, error.message || "Failed to fetch leads");

  const mappedLeads = data.map((l) => {
    const fName = l.employee_profiles?.first_name || '';
    const lName = l.employee_profiles?.last_name || '';
    const fullName = (fName + (lName ? ' ' + lName : '')).trim() || 'Unassigned';
    return {
      id: l.id,
      name: l.name,
      phone: l.phone,
      email: l.email,
      source_id: l.source_id,
      course_id: l.interested_course_id,
      course: l.courses?.name || "",
      stage: l.stage,
      owner: l.owner,
      hot: l.is_hot,
      note: l.note,
      assignee: l.assigned_sales_id,
      assigneeName: fullName,
      foundBy: l.assigned_sales_id,
      foundByName: fullName,
      created_at: timeAgo(l.created_at),
      raw_created_at: l.created_at
    };
  });

  return res.status(200).json(new ApiResponse(200, mappedLeads, "Leads fetched successfully"));
});

// @desc    Create a lead
// @route   POST /api/v1/leads
export const createLead = asyncHandler(async (req, res) => {
  const { name, phone, email, source_name, course_id, assigned_sales_id, owner, note, stage } = req.body;

  if (!name || !phone || !source_name) {
    throw new ApiError(400, "Name, phone, and source are required");
  }

  let finalSourceId = null;
  const { data: existingSource } = await supabase.from("lead_sources").select("id").ilike("source_name", source_name).maybeSingle();
  
  if (existingSource) {
    finalSourceId = existingSource.id;
  } else {
    const { data: newSource, error: sourceError } = await supabase.from("lead_sources").insert([{ source_name }]).select().single();
    if (sourceError) throw new ApiError(500, sourceError.message || "Failed to create new lead source");
    finalSourceId = newSource.id;
  }

  const { data, error } = await supabase
    .from("leads")
    .insert([{
      name,
      phone,
      email,
      source_id: finalSourceId,
      interested_course_id: course_id || null,
      assigned_sales_id: assigned_sales_id || null,
      owner,
      note,
      stage: stage || 'NEW'
    }])
    .select()
    .single();

  if (error) throw new ApiError(500, error.message || "Failed to create lead");

  return res.status(201).json(new ApiResponse(201, data, "Lead created successfully"));
});

// @desc    Update lead stage
// @route   PUT /api/v1/leads/:id
export const updateLeadStage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { stage } = req.body;

  if (!stage) throw new ApiError(400, "Stage is required");

  const { data, error } = await supabase
    .from("leads")
    .update({ stage })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new ApiError(500, error.message || "Failed to update lead stage");

  return res.status(200).json(new ApiResponse(200, data, "Lead stage updated successfully"));
});

// @desc    Get lead sources
// @route   GET /api/v1/lead-sources
export const getLeadSources = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("lead_sources")
    .select("*")
    .order("source_name", { ascending: true });

  if (error) throw new ApiError(500, error.message || "Failed to fetch lead sources");

  return res.status(200).json(new ApiResponse(200, data, "Lead sources fetched successfully"));
});

// @desc    Get performance by salesperson
// @route   GET /api/v1/leads/performance
export const getPerformance = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("leads")
    .select(`
      id,
      assigned_sales_id,
      employee_profiles ( first_name, last_name )
    `);

  if (error) throw new ApiError(500, error.message || "Failed to fetch leads for performance");

  const counts = {};
  data.forEach((l) => {
    const spId = l.assigned_sales_id;
    if (!spId) return;
    if (!counts[spId]) {
      const fName = l.employee_profiles?.first_name || '';
      const lName = l.employee_profiles?.last_name || '';
      const initials = (fName.charAt(0) + lName.charAt(0)).toUpperCase() || 'UN';
      const fullName = (fName + (lName ? ' ' + lName : '')).trim() || 'Unassigned';

      counts[spId] = {
        initials,
        name: fullName,
        count: 0
      };
    }
    counts[spId].count++;
  });

  return res.status(200).json(new ApiResponse(200, Object.values(counts), "Performance fetched successfully"));
});

// @desc    Add activity/message to lead
// @route   POST /api/v1/leads/:id/activities
export const addLeadActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text, performed_by } = req.body;

  if (!text) throw new ApiError(400, "Text is required");

  // In a real app, performed_by would come from req.user. We'll accept it from body or fallback.
  // Actually, lead_activities requires performed_by. We'll allow it to be optional and use the lead's assignee if not provided, or a dummy.
  // Wait, performed_by is UUID NOT NULL REFERENCES employee_profiles(id). We need a valid employee ID.
  
  // Let's get the lead's assignee to use as fallback
  let empId = performed_by;
  if (!empId) {
    const { data: lead } = await supabase.from("leads").select("assigned_sales_id").eq("id", id).single();
    if (lead?.assigned_sales_id) {
      empId = lead.assigned_sales_id;
    } else {
      // If no assignee, find first employee to avoid constraint error
      const { data: emp } = await supabase.from("employee_profiles").select("id").limit(1).single();
      empId = emp?.id;
    }
  }

  const { data, error } = await supabase
    .from("lead_activities")
    .insert([{
      lead_id: id,
      activity_type: 'NOTE',
      notes: text,
      performed_by: empId
    }])
    .select()
    .single();

  if (error) throw new ApiError(500, error.message || "Failed to add activity");

  return res.status(201).json(new ApiResponse(201, data, "Activity added successfully"));
});

// @desc    Get lead activities
// @route   GET /api/v1/leads/:id/activities
export const getLeadActivities = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("lead_activities")
    .select(`
      id, activity_type, notes, created_at,
      employee_profiles ( first_name, last_name )
    `)
    .eq("lead_id", id)
    .order("created_at", { ascending: true });

  if (error) throw new ApiError(500, error.message || "Failed to fetch activities");

  const mappedActivities = data.map((a) => {
    const date = new Date(a.created_at);
    const fName = a.employee_profiles?.first_name || '';
    const lName = a.employee_profiles?.last_name || '';
    const senderName = (fName + (lName ? ' ' + lName : '')).trim() || 'System';
    return {
      id: a.id,
      text: a.notes,
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: senderName
    };
  });

  return res.status(200).json(new ApiResponse(200, mappedActivities, "Activities fetched successfully"));
});
