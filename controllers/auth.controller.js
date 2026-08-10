import {
  forgotPasswordService,
  getCurrentUserService,
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
  resetPasswordService,
  updateMyProfileService
} from "../services/auth.service.js"
import asyncHandler from "../utils/asyncHandler.js"

export const register = asyncHandler(async (req, res) => {
  const result = await registerService(req.body)
  res.status(201).json({ success: true, message: "Account created successfully", data: result })
})

export const login = asyncHandler(async (req, res) => {
  const result = await loginService(req.body)
  res.status(200).json({ success: true, message: "Login successful", data: result })
})

export const logout = asyncHandler(async (req, res) => {
  const result = await logoutService(req.user.id)
  res.status(200).json({ success: true, message: "Logout successful", data: result })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await forgotPasswordService(req.body)
  res.status(200).json({ success: true, message: "Password reset request processed", data: result })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await resetPasswordService(req.body)
  res.status(200).json({ success: true, message: "Password reset successful", data: result })
})

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.headers["x-refresh-token"]
  const result = await refreshTokenService(token)
  res.status(200).json({ success: true, message: "Token refreshed successfully", data: result })
})

export const me = asyncHandler(async (req, res) => {
  const result = await getCurrentUserService(req.user.id)
  res.status(200).json({ success: true, data: result })
})

export const updateMyProfile = asyncHandler(
  async (req, res) => {

    const result =
      await updateMyProfileService(
        req.user.id,
        req.body,
        req.files
      );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  }
);