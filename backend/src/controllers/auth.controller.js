import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import { loginUserService, registerUserService, changePasswordService } from "../services/auth.service.js";

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

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

  // Temporary: allow setting role via registration body for initial setup
  const user = await registerUserService(email, password, role, additionalDetails);

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
