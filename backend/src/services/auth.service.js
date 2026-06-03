import bcrypt from "bcrypt";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

export const loginUserService = async (email, password) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    throw new ApiError(401, "User Not Found");
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { error: updateError } = await supabase
    .from("users")
    .update({
      refresh_token: refreshToken,
      last_login: new Date(),
    })
    .eq("id", user.id);

  if (updateError) {
    throw new ApiError(500, "Failed to update user with refresh Token");
  }

  delete user.password;

  return {
    user,
    accessToken,
    refreshToken,
  };
};
