import { ApiError } from "../utils/ApiError.js";

export const authorize = ({ roles = [], employeeRoles = [] } = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Access Denied"));
    }

    if (
      employeeRoles.length &&
      !employeeRoles.includes(req.user.employeeRole)
    ) {
      return next(new ApiError(403, "Insufficient Permissions"));
    }

    next();
  };
};
