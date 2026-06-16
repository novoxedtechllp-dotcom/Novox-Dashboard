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

    const employeeRole = req.user.employeeRole || req.user.employee_role;

    if (employeeRoles.length > 0 && employeeRoles.includes(employeeRole)) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return next(new ApiError(403, "Access Denied"));
    }

    next();
  };
};
