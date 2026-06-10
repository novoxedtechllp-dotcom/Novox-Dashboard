import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { loginUserService, registerUserService, changePasswordService } from "../services/auth.service.js";

const login = asyncHandler(async (req, res) => {
  console.log("Login hit");
  const { email, password } = req.body;
  console.log("Email: ", email);
  console.log("Password: ", password);

  const result = await loginUserService(email, password);

  const cookieOptions = {
    httpOnly: true,
    secure: false,
  };

  return res
    .status(200)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: result.user,
          accessToken: result.accessToken,
        },
        "Login successful",
      ),
    );
});

const register = asyncHandler(async (req, res) => {
  const { email, password, role, ...additionalDetails } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Public registration only allows STUDENT role.
  // Admin and Employee accounts must be created through their respective management endpoints.
  if (role && role !== 'STUDENT') {
    throw new ApiError(403, "Public registration is only available for Student accounts");
  }

  const user = await registerUserService(email, password, 'STUDENT', additionalDetails);

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User registered successfully"));
});

const logout = asyncHandler(async (req, res) => {
  const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  };

  if (req.user?.id) {
    // Need to import supabase for this to work
    const { supabase } = await import("../config/supabase.js");
    await supabase.from("users").update({ refresh_token: null }).eq("id", req.user.id);
  }

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logout successful"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }

  await changePasswordService(req.user.id, oldPassword, newPassword);

  return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

export { register, login, logout, getCurrentUser, changePassword };
