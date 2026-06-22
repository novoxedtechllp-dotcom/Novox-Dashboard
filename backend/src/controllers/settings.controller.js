import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc    Get Company Settings
// @route   GET /api/v1/settings
export const getSettings = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new ApiError(500, error.message || "Failed to fetch settings");
  }

  return res.status(200).json(new ApiResponse(200, data || {}, "Settings fetched successfully"));
});

// @desc    Update Company Settings
// @route   PUT /api/v1/settings
export const updateSettings = asyncHandler(async (req, res) => {
  const { late_time, half_day_time } = req.body;

  // Ensure row exists
  const { data: existing, error: fetchError } = await supabase
    .from("company_settings")
    .select("id")
    .limit(1)
    .single();

  let data, error;

  if (existing) {
    const response = await supabase
      .from("company_settings")
      .update({ late_time, half_day_time, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select();
    data = response.data;
    error = response.error;
  } else {
    const response = await supabase
      .from("company_settings")
      .insert({ late_time, half_day_time })
      .select();
    data = response.data;
    error = response.error;
  }

  if (error) {
    throw new ApiError(500, error.message || "Failed to update settings");
  }

  return res.status(200).json(new ApiResponse(200, data[0], "Settings updated successfully"));
});
