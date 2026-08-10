import AppError from "../errorhandler/AppError.js"
import { appConfig } from "../config/app.config.js"

export const notFound = (req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
}

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500
  const response = {
    success: false,
    message: err.message || "Internal Server Error"
  }

  if (appConfig.nodeEnv !== "production") {
    response.stack = err.stack
  }

  res.status(statusCode).json(response)
}