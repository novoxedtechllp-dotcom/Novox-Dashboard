import { ApiError } from "../utils/ApiError.js";

export const authorize = ({ roles = [], employeeRoles = [] } = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    if (roles.length === 0 && employeeRoles.length === 0) {
      return next();
    }

    let isAuthorized = false;

    if (roles.length > 0 && roles.includes(req.user.role)) {
      isAuthorized = true;
    }

    if (employeeRoles.length > 0 && employeeRoles.includes(req.user.employeeRole)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return next(new ApiError(403, "Access Denied"));
    }

    next();
  };
};
