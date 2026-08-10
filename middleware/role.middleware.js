import { Roles, rolePriority } from "../config/roles.config.js"
import AppError from "../errorhandler/AppError.js"

export const authorizeMinimumRole = (minimumRole) => {
  return (req, _res, next) => {
    const userRole = req.user?.role || Roles.PUBLIC
    const userPriority = rolePriority[userRole] ?? -1
    const minimumPriority = rolePriority[minimumRole] ?? Number.MAX_SAFE_INTEGER

    if (userPriority < minimumPriority) {
      return next(new AppError("You do not have permission to access this resource", 403))
    }

    return next()
  }
}

export const authorizeRoles = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return next(new AppError("You do not have permission to access this resource", 403))
    }

    return next()
  }
}