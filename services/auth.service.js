import crypto from "crypto";

import AppError from "../errorhandler/AppError.js";
import { Roles } from "../config/roles.config.js";
import { prisma } from "../config/prisma.config.js";
import {findUserByEmail} from "../utils/findUserByEmail.js";
import { toPublicUser } from "../utils/sanitizeingUser.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import {sendPasswordResetEmail} from "../utils/emailService.js"
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import userValidation from "../inputValidation/user.validation.js";







// ======================================================
// AUTH PAYLOAD
// ======================================================

const buildAuthPayload = (user) => {

  const accessToken = signAccessToken(user);

  const refreshToken = signRefreshToken(user);

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
};


// ======================================================
// REGISTER
// ======================================================

export const registerService = async (payload) => {

  const fullName = payload?.fullName?.trim();

  const email = payload?.email
    ?.trim()
    .toLowerCase();

  const phoneNumber = payload?.phoneNumber?.trim();
  const condoCode = payload?.condoCode?.trim();
  const password = payload?.password;
const {error} = userValidation.validate(payload)

  // ----------------------------------------------
  // VALIDATION
  // ----------------------------------------------

  if (
error
  ) {
    throw new AppError(
      error,
      400
    );
  }


  // ----------------------------------------------
  // CHECK EMAIL
  // ----------------------------------------------

  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw new AppError(
      "Email is already registered",
      409
    );
  }


  // ----------------------------------------------
  // CHECK PHONE
  // ----------------------------------------------

  const existingPhone = await prisma.user.findUnique({
    where: {
      phoneNumber,
    },
  });

  if (existingPhone) {
    throw new AppError(
      "Phone number is already registered",
      409
    );
  }


  // ----------------------------------------------
  // HASH PASSWORD
  // ----------------------------------------------

  const hashedPassword = await hashPassword(password);


  // ----------------------------------------------
  // CREATE USER
  // ----------------------------------------------

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phoneNumber,

      // IMPORTANT:
      // Prisma field is `password`
      password: hashedPassword,
      condoId:condoCode,
      role: Roles.RESIDENT,
    },
  });


  // ----------------------------------------------
  // CREATE TOKENS
  // ----------------------------------------------

  const accessToken = signAccessToken(user);

  const refreshToken = signRefreshToken(user);


  // ----------------------------------------------
  // STORE REFRESH TOKEN
  // ----------------------------------------------

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken,
    },
  });


  // ----------------------------------------------
  // RESPONSE
  // ----------------------------------------------

  return {
    user: toPublicUser(user),

    accessToken,

    refreshToken,
  };
};


// ======================================================
// LOGIN
// ======================================================

export const loginService = async (payload) => {

  const email = payload?.email
    ?.trim()
    .toLowerCase();

  const password = payload?.password;


  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400
    );
  }


  // ----------------------------------------------
  // FIND USER
  // ----------------------------------------------

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(
      "Invalid credentials",
      401
    );
  }


  // ----------------------------------------------
  // CHECK PASSWORD
  // ----------------------------------------------

  const passwordMatches = await comparePassword(
    password,
    user.password
  );


  if (!passwordMatches) {
    throw new AppError(
      "Invalid credentials",
      401
    );
  }


  // ----------------------------------------------
  // CREATE TOKENS
  // ----------------------------------------------

  const accessToken = signAccessToken(user);

  const refreshToken = signRefreshToken(user);


  // ----------------------------------------------
  // STORE REFRESH TOKEN
  // ----------------------------------------------

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken,
    },
  });


  return {
    user: toPublicUser(user),

    accessToken,

    refreshToken,
  };
};


// ======================================================
// REFRESH TOKEN
// ======================================================

export const refreshTokenService = async (refreshToken) => {

  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      400
    );
  }


  // ----------------------------------------------
  // VERIFY JWT
  // ----------------------------------------------

  let payload;

  try {

    payload = verifyRefreshToken(refreshToken);

  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401
    );
  }


  // ----------------------------------------------
  // FIND USER
  // ----------------------------------------------

  const user = await findUserByIdService(
    payload.sub
  );

  if (!user) {
    throw new AppError(
      "User account no longer exists",
      401
    );
  }


  // ----------------------------------------------
  // CHECK STORED TOKEN
  // ----------------------------------------------

  if (
    !user.refreshToken ||
    user.refreshToken !== refreshToken
  ) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }


  // ----------------------------------------------
  // ROTATE TOKENS
  // ----------------------------------------------

  const accessToken = signAccessToken(user);

  const newRefreshToken = signRefreshToken(user);


  // ----------------------------------------------
  // STORE NEW REFRESH TOKEN
  // ----------------------------------------------

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken: newRefreshToken,
    },
  });


  return {
    user: toPublicUser(user),

    accessToken,

    refreshToken: newRefreshToken,
  };
};


// ======================================================
// LOGOUT
// ======================================================

export const logoutService = async (userId) => {

  await prisma.user.update({
    where: {
      id: String(userId),
    },

    data: {
      refreshToken: null,
    },
  });


  return {
    loggedOut: true,
  };
};


// ======================================================
// FORGOT PASSWORD
// ======================================================


export const forgotPasswordService = async (payload) => {

  const email = payload?.email
    ?.trim()
    .toLowerCase();


  if (!email) {
    throw new AppError(
      "Email is required",
      400
    );
  }


  const user = await findUserByEmail(email);


  // Do not reveal whether the email exists
  if (!user) {

    return {
      message:
        "If the email exists, a password reset link has been sent",
    };
  }


  // ====================================================
  // GENERATE RANDOM TOKEN
  // ====================================================

  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");


  // ====================================================
  // HASH TOKEN FOR DATABASE
  // ====================================================

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");


  // ====================================================
  // 15 MINUTE EXPIRATION
  // ====================================================

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );


  // ====================================================
  // SAVE HASHED TOKEN
  // ====================================================

  await prisma.user.update({

    where: {
      id: user.id,
    },

    data: {

      resetPasswordToken:
        hashedResetToken,

      resetPasswordExpires:
        expiresAt,
    },
  });


  // ====================================================
  // CREATE FRONTEND RESET URL
  // ====================================================

  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;


  // ====================================================
  // SEND EMAIL
  // ====================================================

  await sendPasswordResetEmail(
    user.email,
    resetUrl
  );


  return {
    message:
      "If the email exists, a password reset link has been sent",
  };
};
// ======================================================
// RESET PASSWORD
// ======================================================


export const resetPasswordService = async (payload) => {

  const token = payload?.token;

  const newPassword = payload?.password;


  if (!token || !newPassword) {

    throw new AppError(
      "Reset token and new password are required",
      400
    );
  }


  // Hash token received from frontend

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");


  // Find matching user

  const user = await prisma.user.findFirst({

    where: {

      resetPasswordToken:
        hashedToken,

      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });


  if (!user) {

    throw new AppError(
      "Invalid or expired reset token",
      400
    );
  }


  // Hash new password

  const hashedPassword =
    await hashPassword(newPassword);


  // Update password and invalidate reset token

  await prisma.user.update({

    where: {
      id: user.id,
    },

    data: {

      password: hashedPassword,

      resetPasswordToken: null,

      resetPasswordExpires: null,

      // Logout existing sessions

      refreshToken: null,
    },
  });


  return {
    passwordReset: true,
  };
};

// ======================================================
// CURRENT USER
// ======================================================

export const getCurrentUserService = async (userId) => {

  const user = await findUserByIdService(userId);


  if (!user) {

    throw new AppError(
      "User not found",
      404
    );
  }


  return {
    user: toPublicUser(user),
  };
};