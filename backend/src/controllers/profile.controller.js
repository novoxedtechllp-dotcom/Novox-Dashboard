import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, extractPublicIdFromUrl, deleteFromCloudinary } from "../utils/cloudinary.js";
import bcrypt from "bcrypt";

// @desc    Get current user's profile
// @route   GET /api/v1/profile/me
export const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Get user data
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, role, status")
    .eq("id", userId)
    .single();

  if (userError || !user) throw new ApiError(404, "User not found");

  // Get employee profile if exists
  const { data: employeeProfile } = await supabase
    .from("employee_profiles")
    .select(`
      *,
      employee_roles(role_name)
    `)
    .eq("user_id", userId)
    .single();

  return res.status(200).json(
    new ApiResponse(200, { user, employeeProfile: employeeProfile || null }, "Profile fetched successfully")
  );
});

// @desc    Update current user's profile
// @route   PUT /api/v1/profile/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const { first_name, last_name, phone, password, avatar_url } = req.body;

  // 1. Update User (password) if provided
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ password_hash: hashedPassword })
      .eq("id", userId);
      
    if (userUpdateError) throw new ApiError(500, "Failed to update password");
  }

  // 2. Update Employee Profile
  const updates = {};
  if (first_name !== undefined) updates.first_name = first_name;
  if (last_name !== undefined) updates.last_name = last_name;
  if (phone !== undefined) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult?.url) {
      updates.avatar_url = uploadResult.url;

      // Delete old avatar from Cloudinary if it exists
      const { data: oldProfile } = await supabase
        .from("employee_profiles")
        .select("avatar_url")
        .eq("user_id", userId)
        .single();
        
      if (oldProfile?.avatar_url) {
        const publicId = extractPublicIdFromUrl(oldProfile.avatar_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    }
  }

  let updatedProfile = null;

  if (Object.keys(updates).length > 0) {
    const { data, error } = await supabase
      .from("employee_profiles")
      .update(updates)
      .eq("user_id", userId)
      .select(`
        *,
        employee_roles(role_name)
      `);

    if (error) throw new ApiError(500, "Failed to update profile details");
    if (data && data.length > 0) {
      updatedProfile = data[0];
    }
  } else {
    // Just fetch current profile to return
    const { data } = await supabase
      .from("employee_profiles")
      .select(`
        *,
        employee_roles(role_name)
      `)
      .eq("user_id", userId)
      .single();
    updatedProfile = data;
  }

  // Fetch latest user data
  const { data: user } = await supabase
    .from("users")
    .select("id, email, role, status")
    .eq("id", userId)
    .single();

  return res.status(200).json(
    new ApiResponse(200, { user, employeeProfile: updatedProfile }, "Profile updated successfully")
  );
});
