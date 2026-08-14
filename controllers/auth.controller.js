import {
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  forgotPasswordService,
  resetPasswordService,
  getCurrentUserService,
  updateMyProfileService,
} from "../services/auth.service.js";


// REGISTER

export const register = async (req, res, next) => {
  try {

    const result =
      await registerService(req.body);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


// LOGIN

export const login = async (req, res, next) => {
  try {

    const result =
      await loginService(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


// REFRESH

export const refreshToken = async (
  req,
  res,
  next
) => {
  try {

    const token =
      req.body.refreshToken;

    const result =
      await refreshTokenService(token);

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


// LOGOUT

export const logout = async (
  req,
  res,
  next
) => {
  try {

    const result =
      await logoutService(req.user.id);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


// FORGOT PASSWORD

export const forgotPassword = async (
  req,
  res,
  next
) => {
  try {

    const result =
      await forgotPasswordService(req.body);

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    next(error);
  }
};


// RESET PASSWORD

export const resetPassword = async (
  req,
  res,
  next
) => {
  try {

    const result =
      await resetPasswordService(req.body);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


// ME

export const me = async (
  req,
  res,
  next
) => {
  try {

    const result =
      await getCurrentUserService(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    next(error);
  }
};


// UPDATE MY PROFILE

export const updateMyProfile = async (
  req,
  res,
  next
) => {
  try {

    const result =
      await updateMyProfileService(
        req.user.id,
        req.body,
        req.files
      );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
};