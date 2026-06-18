import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// @desc    Get all roles with permissions
// @route   GET /api/v1/roles
export const getRoles = asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from("employee_roles")
    .select(`
      id,
      role_name,
      description,
      permissions
    `);

  if (error) {
    throw new ApiError(500, error.message || "Failed to fetch roles");
  }

  // Also fetch employee counts/assignments per role to show in frontend Staff section
  const { data: staffData, error: staffError } = await supabase
    .from("employee_profiles")
    .select("id, first_name, last_name, designation, role_id, avatar_url")
    .eq("status", "ACTIVE");
    
  if (staffError) {
    throw new ApiError(500, staffError.message || "Failed to fetch staff");
  }

  return res.status(200).json(
    new ApiResponse(200, { roles: data, staff: staffData }, "Roles fetched successfully")
  );
});

// @desc    Create a new role
// @route   POST /api/v1/roles
export const createRole = asyncHandler(async (req, res) => {
  const { role_name, description, permissions } = req.body;

  if (!role_name) {
    throw new ApiError(400, "Role name is required");
  }

  const { data, error } = await supabase
    .from("employee_roles")
    .insert([
      { 
        role_name: role_name.toUpperCase(), 
        description: description || null,
        permissions: permissions || {} 
      }
    ])
    .select();

  if (error) {
    throw new ApiError(500, error.message || "Failed to create role");
  }

  return res.status(201).json(new ApiResponse(201, data[0], "Role created successfully"));
});

// @desc    Update a role's permissions or details
// @route   PUT /api/v1/roles/:roleId
export const updateRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;
  const { permissions, description } = req.body;

  const updates = {};
  if (permissions !== undefined) updates.permissions = permissions;
  if (description !== undefined) updates.description = description;

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields to update");
  }

  const { data, error } = await supabase
    .from("employee_roles")
    .update(updates)
    .eq("id", roleId)
    .select();

  if (error) {
    throw new ApiError(500, error.message || "Failed to update role");
  }

  if (!data || data.length === 0) {
    throw new ApiError(404, "Role not found");
  }

  return res.status(200).json(new ApiResponse(200, data[0], "Role updated successfully"));
});

// @desc    Delete a role
// @route   DELETE /api/v1/roles/:roleId
export const deleteRole = asyncHandler(async (req, res) => {
  const { roleId } = req.params;

  // Check if role is assigned to anyone
  const { count, error: countError } = await supabase
    .from("employee_profiles")
    .select("*", { count: 'exact', head: true })
    .eq("role_id", roleId)
    .eq("status", "ACTIVE");

  if (countError) {
    throw new ApiError(500, "Failed to check role assignments");
  }

  if (count > 0) {
    throw new ApiError(400, `Cannot delete role. It is currently assigned to ${count} active employee(s).`);
  }

  const { error } = await supabase
    .from("employee_roles")
    .delete()
    .eq("id", roleId);

  if (error) {
    throw new ApiError(500, error.message || "Failed to delete role");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Role deleted successfully"));
});
