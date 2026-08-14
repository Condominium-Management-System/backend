import crypto from "crypto";

import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";
import { Roles } from "../config/roles.config.js";

import { findUserByEmail } from "../utils/findUserByEmail.js";
import { findUserByIdService } from "../utils/FindUserById.js";

import { toPublicUser } from "../utils/sanitizeingUser.js";

import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import { sendPasswordResetEmail } from "../utils/emailService.js";

import userValidation from "../inputValidation/user.validation.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";


// AUTH PAYLOAD

const buildAuthPayload = (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
};


// REGISTER

export const registerService = async (payload) => {

  // VALIDATE INPUT

  const { error, value } = userValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  const fullName = value.fullName.trim();
  const email = value.email.trim().toLowerCase();
  const phoneNumber = value.phoneNumber.trim();
  const condoCode = value.condoCode.trim();
  const fan = value.fan.trim();
  const password = value.password;

  // EMAIL

  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw new AppError(
      "Email is already registered",
      409
    );
  }

  // PHONE

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

  // FAN

  const existingFan = await prisma.user.findUnique({
    where: {
      fan,
    },
  });

  if (existingFan) {
    throw new AppError(
      "FAN number is already registered",
      409
    );
  }

  // FIND CONDOMINIUM

  const condo = await prisma.condo.findFirst({
    where: {
      condoCode,
      deletedAt: null,
    },
  });

  if (!condo) {
    throw new AppError(
      "Invalid condominium code",
      404
    );
  }

  // CHECK CONDOMINIUM

  if (!condo.activeStatus) {
    throw new AppError(
      "This condominium is inactive",
      403
    );
  }

  // HASH PASSWORD

  const hashedPassword = await hashPassword(password);

  // CREATE USER
  //
  // IMPORTANT:
  // Every self-registered user starts as RESIDENT.
  //
  // Admin/guard promotion happens later.

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,

      fan,

      role: Roles.RESIDENT,

      condoId: condo.id,
      condoCode: condo.condoCode,

      // Admin must verify later
      isVerified: false,
    },
  });

  // TOKENS

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // SAVE REFRESH TOKEN

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken,
    },
  });

  // RESPONSE

  return {
    user: toPublicUser(updatedUser),
    accessToken,
    refreshToken,
  };
};


// LOGIN

export const loginService = async (payload) => {
  const email = payload?.email?.trim().toLowerCase();
  const phoneNumber = payload?.phoneNumber?.trim();
  const password = payload?.password;

  // VALIDATION

  if ((!email && !phoneNumber) || !password) {
    throw new AppError(
      "Email or phone number and password are required",
      400
    );
  }

  // FIND USER

  let user = null;

  if (email) {
    user = await findUserByEmail(email);
  }

  if (!user && phoneNumber) {
    user = await prisma.user.findUnique({
      where: {
        phoneNumber,
      },
    });
  }

  // USER NOT FOUND

  if (!user) {
    throw new AppError(
      "Invalid credentials",
      401
    );
  }

  // DELETED ACCOUNT

  if (user.deletedAt) {
    throw new AppError(
      "User account has been deleted",
      403
    );
  }

  // PASSWORD

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

  // CONDO CHECK

  if (
    user.condoId &&
    user.role !== Roles.SUPER_ADMIN
  ) {
    const condo = await prisma.condo.findFirst({
      where: {
        id: user.condoId,
        deletedAt: null,
      },
    });

    if (!condo || !condo.activeStatus) {
      throw new AppError(
        "Your condominium account is inactive",
        403
      );
    }
  }

  // TOKENS

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // SAVE REFRESH TOKEN

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken,
    },
  });

  // RESPONSE

  return {
    user: toPublicUser(updatedUser),
    accessToken,
    refreshToken,
  };
};

// REFRESH TOKEN

export const refreshTokenService = async (
  refreshToken
) => {

  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      400
    );
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401
    );
  }

  // FIND USER

  const user = await findUserByIdService(
    payload.sub
  );

  if (!user) {
    throw new AppError(
      "User account no longer exists",
      401
    );
  }

  // DELETED

  if (user.deletedAt) {
    throw new AppError(
      "User account has been deleted",
      401
    );
  }

  // STORED TOKEN

  if (
    !user.refreshToken ||
    user.refreshToken !== refreshToken
  ) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  // ROTATE

  const accessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

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


// LOGOUT

export const logoutService = async (userId) => {

  const user = await prisma.user.findUnique({
    where: {
      id: String(userId),
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken: null,
    },
  });

  return {
    loggedOut: true,
  };
};


// FORGOT PASSWORD

export const forgotPasswordService = async (
  payload
) => {

  const email = payload?.email?.trim().toLowerCase();

  if (!email) {
    throw new AppError(
      "Email is required",
      400
    );
  }

  const user = await findUserByEmail(email);

  // Don't reveal whether account exists
  if (!user) {
    return {
      message:
        "If the email exists, a password reset link has been sent",
    };
  }

  // GENERATE TOKEN

  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

  // HASH TOKEN

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // EXPIRATION

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  // SAVE

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: expiresAt,
    },
  });

  // URL

  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // EMAIL

  await sendPasswordResetEmail(
    user.email,
    resetUrl
  );

  return {
    message:
      "If the email exists, a password reset link has been sent",
  };
};


// RESET PASSWORD

export const resetPasswordService = async (
  payload
) => {

  const token = payload?.token;
  const newPassword = payload?.password;

  if (!token || !newPassword) {
    throw new AppError(
      "Reset token and new password are required",
      400
    );
  }

  if (newPassword.length < 8) {
    throw new AppError(
      "Password must be at least 8 characters",
      400
    );
  }

  // HASH TOKEN

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // FIND USER

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,

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

  // HASH PASSWORD

  const hashedPassword =
    await hashPassword(newPassword);

  // UPDATE

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      password: hashedPassword,

      resetPasswordToken: null,
      resetPasswordExpires: null,

      refreshToken: null,
    },
  });

  return {
    passwordReset: true,
  };
};


// CURRENT USER

export const getCurrentUserService = async (
  userId
) => {

  const user = await findUserByIdService(
    userId
  );

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (user.deletedAt) {
    throw new AppError(
      "User account has been deleted",
      403
    );
  }

  return {
    user: toPublicUser(user),
  };
};


// UPDATE MY PROFILE

export const updateMyProfileService = async (
  userId,
  payload,
  files
) => {

  const user = await prisma.user.findUnique({
    where: {
      id: String(userId),
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (user.deletedAt) {
    throw new AppError(
      "User account has been deleted",
      403
    );
  }

  const {
    fullName,
    email,
    phoneNumber,
    fan,
    password,
  } = payload;

  const data = {};

  // FULL NAME

  if (fullName !== undefined) {

    const cleanedFullName =
      fullName.trim();

    if (cleanedFullName.length < 3) {
      throw new AppError(
        "Full name should be at least 3 characters",
        400
      );
    }

    data.fullName = cleanedFullName;
  }

  // EMAIL

  if (email !== undefined) {

    const cleanedEmail =
      email.trim().toLowerCase();

    if (!cleanedEmail) {
      throw new AppError(
        "Email cannot be empty",
        400
      );
    }

    if (cleanedEmail !== user.email) {

      const existing =
        await prisma.user.findUnique({
          where: {
            email: cleanedEmail,
          },
        });

      if (existing) {
        throw new AppError(
          "Email is already registered",
          409
        );
      }

      data.email = cleanedEmail;
    }
  }

  // PHONE

  if (phoneNumber !== undefined) {

    const cleanedPhone =
      phoneNumber.trim();

    if (
      !/^(09|07)\d{8}$|^\+251[79]\d{8}$/.test(
        cleanedPhone
      )
    ) {
      throw new AppError(
        "Invalid Ethiopian phone number",
        400
      );
    }

    if (cleanedPhone !== user.phoneNumber) {

      const existing =
        await prisma.user.findUnique({
          where: {
            phoneNumber: cleanedPhone,
          },
        });

      if (existing) {
        throw new AppError(
          "Phone number is already registered",
          409
        );
      }

      data.phoneNumber = cleanedPhone;
    }
  }

  // FAN

  if (fan !== undefined) {

    const cleanedFan =
      fan.trim();

    if (!/^\d{16}$/.test(cleanedFan)) {
      throw new AppError(
        "FAN number should be exactly 16 digits",
        400
      );
    }

    if (cleanedFan !== user.fan) {

      const existing =
        await prisma.user.findUnique({
          where: {
            fan: cleanedFan,
          },
        });

      if (existing) {
        throw new AppError(
          "FAN number is already registered",
          409
        );
      }

      data.fan = cleanedFan;
    }
  }

  // PASSWORD

  if (password !== undefined) {

    const cleanedPassword =
      password.trim();

    if (cleanedPassword.length < 8) {
      throw new AppError(
        "Password must be at least 8 characters",
        400
      );
    }

    data.password =
      await hashPassword(cleanedPassword);

    // Invalidate old sessions
    data.refreshToken = null;
  }

  // PROFILE PHOTO

  if (files?.profilePhoto?.[0]) {

    const result =
      await uploadToCloudinary(
        files.profilePhoto[0].buffer,
        "yekondominium/profile"
      );

    data.profilePhoto =
      result.secure_url;
  }

  // FRONT ID

  if (files?.frontId?.[0]) {

    const result =
      await uploadToCloudinary(
        files.frontId[0].buffer,
        "yekondominium/ids"
      );

    data.frontId =
      result.secure_url;
  }

  // BACK ID

  if (files?.backId?.[0]) {

    const result =
      await uploadToCloudinary(
        files.backId[0].buffer,
        "yekondominium/ids"
      );

    data.backId =
      result.secure_url;
  }

  // NOTHING

  if (Object.keys(data).length === 0) {
    throw new AppError(
      "No valid profile information was provided",
      400
    );
  }

  // UPDATE

  const updatedUser =
    await prisma.user.update({
      where: {
        id: String(userId),
      },

      data,
    });

  return {
    user: toPublicUser(updatedUser),
  };
};