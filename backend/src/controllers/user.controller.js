import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const userSelectFields = "id, email, role, status, last_login, created_at, updated_at";

// @desc    Create a new user
// @route   POST /api/v1/users
export const createUser = asyncHandler(async (req, res) => {
  const { email, password_hash, role, status } = req.body;

  if (!email || !password_hash || !role) {
    throw new ApiError(400, "Please provide email, password_hash, and role");
  }

  const { data, error } = await supabase
    .from("users")
    .insert([{ email, password_hash, role, status: status || "ACTIVE" }])
    .select(userSelectFields);

  if (error) throw new ApiError(500, error.message || "Failed to create user");

  return res.status(201).json(new ApiResponse(201, data[0], "User created successfully"));
});

// @desc    Get all users
// @route   GET /api/v1/users
export const getUsers = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from("users").select(userSelectFields);

  if (error) throw new ApiError(500, error.message || "Failed to fetch users");

  return res.status(200).json(new ApiResponse(200, data, "Users fetched successfully"));
});

// @desc    Get single user by ID
// @route   GET /api/v1/users/:id
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("users")
    .select(userSelectFields)
    .eq("id", id)
    .single();

  if (error) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, data, "User fetched successfully"));
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent updating password through this route usually, but allowed here for simplicity
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select(userSelectFields);

  if (error) throw new ApiError(500, error.message || "Failed to update user");
  if (!data || data.length === 0) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, data[0], "User updated successfully"));
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("users")
    .delete()
    .eq("id", id)
    .select(userSelectFields);

  if (error) throw new ApiError(500, error.message || "Failed to delete user");
  if (!data || data.length === 0) throw new ApiError(404, "User not found");

  return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});
