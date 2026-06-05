import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    next(new ApiError(401, "Invalid token"));
  }
};
