import bcrypt from "bcrypt";
import { supabase } from "../config/supabase.js";
import { ApiError } from "../utils/ApiError.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { ROLES } from "../constants/roles.js";

export const registerUserService = async (email, password, role, additionalDetails = {}) => {
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Validate role against ROLES constant
  const userRole = role || ROLES.STUDENT;
  if (!Object.values(ROLES).includes(userRole)) {
    throw new ApiError(400, "Invalid role provided");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert([{ email, password_hash: hashedPassword, role: userRole, status: "ACTIVE" }])
    .select("id, email, role, status, created_at, updated_at")
    .single();

  if (error) {
    throw new ApiError(500, error.message || "Failed to register user");
  }

  // Insert into corresponding profile table
  if (userRole === ROLES.STUDENT) {
    const { first_name, last_name, phone, parent_phone, address, joining_date } = additionalDetails;
    if (!first_name || !last_name || !phone || !joining_date) {
      await supabase.from("users").delete().eq("id", user.id);
      throw new ApiError(400, "Please provide all required student fields: first_name, last_name, phone, joining_date");
    }

    const student_code = `STU-${Date.now()}`;

    const { error: studentError } = await supabase.from("students").insert([{
      user_id: user.id, student_code, first_name, last_name, phone, parent_phone,
      address, joining_date, status: "ACTIVE"
    }]);
    if (studentError) {
      await supabase.from("users").delete().eq("id", user.id);
      throw new ApiError(500, studentError.message || "Failed to create student profile");
    }
  } else if (userRole === ROLES.EMPLOYEE) {
    const { first_name, last_name, phone, joining_date, designation, employee_role, salary } = additionalDetails;
    if (!first_name || !last_name || !joining_date || !designation || !employee_role) {
      await supabase.from("users").delete().eq("id", user.id);
      throw new ApiError(400, "Please provide all required employee fields: first_name, last_name, joining_date, designation, employee_role");
    }

    // Lookup role_id
    const { data: roleData, error: roleError } = await supabase
      .from("employee_roles")
      .select("id")
      .eq("role_name", employee_role)
      .single();

    if (roleError || !roleData) {
      await supabase.from("users").delete().eq("id", user.id);
      throw new ApiError(400, `Invalid employee role specified: ${employee_role}`);
    }

    const employee_code = `EMP-${Date.now()}`;

    const { error: employeeError } = await supabase.from("employee_profiles").insert([{
      user_id: user.id, employee_code, first_name, last_name, phone, joining_date, designation, 
      role_id: roleData.id, salary: salary || 0, status: "ACTIVE"
    }]);
    if (employeeError) {
      await supabase.from("users").delete().eq("id", user.id);
      throw new ApiError(500, employeeError.message || "Failed to create employee profile");
    }
  }

  return user;
};

export const loginUserService = async (email, password) => {
  const { data: user, error } = await supabase
    .from("users")
    .select(`
      *,
      employee_profiles(
        first_name,
        last_name,
        designation,
        employee_roles(role_name)
      ),
      students(
        first_name,
        last_name
      )
    `)
    .eq("email", email)
    .single();

  if (error || !user) {
    throw new ApiError(401, "User Not Found");
  }

  // Extract employeeRole and other profile details
  if (user.role === 'EMPLOYEE' && user.employee_profiles && user.employee_profiles.length > 0) {
    const profile = user.employee_profiles[0];
    user.employee_role = profile.employee_roles?.role_name;
    user.first_name = profile.first_name;
    user.last_name = profile.last_name;
    user.designation = profile.designation;
  } else if (user.role === 'STUDENT' && user.students && user.students.length > 0) {
    const profile = user.students[0];
    user.first_name = profile.first_name;
    user.last_name = profile.last_name;
  }

  // Cleanup joined data
  delete user.employee_profiles;
  delete user.students;

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
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

  delete user.password_hash;
  delete user.refresh_token;
  delete user.access_token;

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const changePasswordService = async (userId, oldPassword, newPassword) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("password_hash")
    .eq("id", userId)
    .single();

  if (error || !user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password_hash);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const { error: updateError } = await supabase
    .from("users")
    .update({ password_hash: hashedPassword })
    .eq("id", userId);

  if (updateError) {
    throw new ApiError(500, "Failed to change password");
  }

  return true;
};
