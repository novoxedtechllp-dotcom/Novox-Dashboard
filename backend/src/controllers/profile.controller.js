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

  const isStudent = user.role === "STUDENT";
  const tableName = isStudent ? "students" : "employee_profiles";
  
  let query = supabase.from(tableName).select(isStudent ? "*" : "*, employee_roles(role_name, permissions)").eq("user_id", userId).single();

  const { data: profile } = await query;

  return res.status(200).json(
    new ApiResponse(200, { user, employeeProfile: profile || null }, "Profile fetched successfully")
  );
});

// @desc    Update current user's profile
// @route   PUT /api/v1/profile/me
export const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single();
  const isStudent = user?.role === "STUDENT";
  const tableName = isStudent ? "students" : "employee_profiles";

  const { first_name, last_name, phone, avatar_url, password } = req.body;

  if (phone !== undefined && phone.length !== 10) {
    throw new ApiError(400, "Phone number must be exactly 10 digits");
  }

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { error: pwdError } = await supabase.from("users").update({ password_hash: hashedPassword }).eq("id", userId);
    if (pwdError) throw new ApiError(500, "Failed to update password");
  }

  const updates = {};
  if (first_name) updates.first_name = first_name;
  if (last_name) updates.last_name = last_name;
  if (phone) updates.phone = phone;
  if (avatar_url !== undefined) updates.avatar_url = avatar_url;

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult && (uploadResult.secure_url || uploadResult.url)) {
      updates.avatar_url = uploadResult.secure_url || uploadResult.url;

      // Delete old avatar from Cloudinary if it exists
      const { data: oldProfile } = await supabase
        .from(tableName)
        .select("avatar_url")
        .eq("user_id", userId)
        .single();
        
      if (oldProfile?.avatar_url) {
        const publicId = extractPublicIdFromUrl(oldProfile.avatar_url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    } else {
      throw new ApiError(500, "Failed to upload image to Cloudinary");
    }
  }

  let updatedProfile = null;

  if (Object.keys(updates).length > 0) {
    let query = supabase.from(tableName).update(updates).eq("user_id", userId).select(isStudent ? "*" : "*, employee_roles(role_name, permissions)");
    const { data, error } = await query;

    if (error) throw new ApiError(500, "Failed to update profile details");
    if (data && data.length > 0) {
      updatedProfile = data[0];
    }
  } else {
    // Just fetch current profile to return
    let query = supabase.from(tableName).select(isStudent ? "*" : "*, employee_roles(role_name, permissions)").eq("user_id", userId).single();
    const { data } = await query;
    updatedProfile = data;
  }

  // Fetch latest user data
  const { data: updatedUser } = await supabase
    .from("users")
    .select("id, email, role, status")
    .eq("id", userId)
    .single();

  return res.status(200).json(
    new ApiResponse(200, { user: updatedUser, employeeProfile: updatedProfile }, "Profile updated successfully")
  );
});
