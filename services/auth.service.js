import crypto from "crypto";

import AppError from "../errorhandler/AppError.js";
import { Roles } from "../config/roles.config.js";
import { prisma } from "../config/prisma.config.js";
import { findUserByEmail } from "../utils/findUserByEmail.js";
import { findUserByIdService } from "../utils/FindUserById.js";
import { toPublicUser } from "../utils/sanitizeingUser.js";
import {
  hashPassword,
  comparePassword,
} from "../utils/password.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import userValidation from "../inputValidation/user.validation.js";
import uploadToCloudinary  from "../utils/uploadToCloudinary.js";

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
  const email = payload?.email?.trim().toLowerCase();
  const phoneNumber = payload?.phoneNumber?.trim();
  const condoCode = payload?.condoCode?.trim();
  const fan = payload?.fan?.trim();
  const password = payload?.password?.trim();

  // ----------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------

  const { error } = userValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  // ----------------------------------------------------
  // CHECK EMAIL
  // ----------------------------------------------------

  const existingEmail = await findUserByEmail(email);

  if (existingEmail) {
    throw new AppError(
      "Email is already registered",
      409
    );
  }

  // ----------------------------------------------------
  // CHECK PHONE
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // CHECK FAN
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // FIND CONDO USING CONDO CODE
  // ----------------------------------------------------

  const condo = await prisma.condo.findUnique({
    where: {
      condoCode,
    },
  });

  if (!condo) {
    throw new AppError(
      "Invalid condominium code",
      404
    );
  }

  // ----------------------------------------------------
  // CHECK CONDO STATUS
  // ----------------------------------------------------

  if (!condo.activeStatus) {
    throw new AppError(
      "This condominium is inactive",
      403
    );
  }

  // ----------------------------------------------------
  // HASH PASSWORD
  // ----------------------------------------------------

  const hashedPassword = await hashPassword(password);

  // ----------------------------------------------------
  // CREATE USER
  // ----------------------------------------------------

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,

      // 16 digit FAN
      fan,

      role: Roles.RESIDENT,

      // Real UUID relation
      condoId: condo.id,

      // Human-readable condo code
      condoCode: condo.condoCode,
    },
  });

  // ----------------------------------------------------
  // CREATE TOKENS
  // ----------------------------------------------------

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // ----------------------------------------------------
  // STORE REFRESH TOKEN
  // ----------------------------------------------------

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken,
    },
  });

  // ----------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------

  return {
    user: toPublicUser(updatedUser),
    accessToken,
    refreshToken,
  };
};

// ======================================================
// LOGIN
// ======================================================

export const loginService = async (payload) => {
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;

  // ----------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------

  if (!email || !password) {
    throw new AppError(
      "Email and password are required",
      400
    );
  }

  // ----------------------------------------------------
  // FIND USER
  // ----------------------------------------------------

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError(
      "Invalid credentials",
      401
    );
  }

  // ----------------------------------------------------
  // CHECK PASSWORD
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // CHECK ACCOUNT
  // ----------------------------------------------------

  if (user.deletedAt) {
    throw new AppError(
      "User account has been deleted",
      403
    );
  }

  // ----------------------------------------------------
  // CREATE TOKENS
  // ----------------------------------------------------

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // ----------------------------------------------------
  // STORE REFRESH TOKEN
  // ----------------------------------------------------

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken,
    },
  });

  // ----------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------

  return {
    user: toPublicUser(updatedUser),
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

  // ----------------------------------------------------
  // VERIFY JWT
  // ----------------------------------------------------

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401
    );
  }

  // ----------------------------------------------------
  // FIND USER
  // ----------------------------------------------------

  const user = await findUserByIdService(
    payload.sub
  );

  if (!user) {
    throw new AppError(
      "User account no longer exists",
      401
    );
  }

  // ----------------------------------------------------
  // CHECK DELETED ACCOUNT
  // ----------------------------------------------------

  if (user.deletedAt) {
    throw new AppError(
      "User account has been deleted",
      401
    );
  }

  // ----------------------------------------------------
  // CHECK STORED TOKEN
  // ----------------------------------------------------

  if (
    !user.refreshToken ||
    user.refreshToken !== refreshToken
  ) {
    throw new AppError(
      "Invalid refresh token",
      401
    );
  }

  // ----------------------------------------------------
  // ROTATE TOKENS
  // ----------------------------------------------------

  const accessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  // ----------------------------------------------------
  // STORE NEW REFRESH TOKEN
  // ----------------------------------------------------

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      refreshToken: newRefreshToken,
    },
  });

  // ----------------------------------------------------
  // RESPONSE
  // ----------------------------------------------------

  return {
    user: toPublicUser(updatedUser),
    accessToken,
    refreshToken: newRefreshToken,
  };
};

// ======================================================
// LOGOUT
// ======================================================

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
  const email = payload?.email?.trim().toLowerCase();

  if (!email) {
    throw new AppError(
      "Email is required",
      400
    );
  }

  const user = await findUserByEmail(email);

  // Do not reveal whether email exists
  if (!user) {
    return {
      message:
        "If the email exists, a password reset link has been sent",
    };
  }

  // ----------------------------------------------------
  // GENERATE RANDOM TOKEN
  // ----------------------------------------------------

  const resetToken = crypto
    .randomBytes(32)
    .toString("hex");

  // ----------------------------------------------------
  // HASH TOKEN
  // ----------------------------------------------------

  const hashedResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // ----------------------------------------------------
  // EXPIRATION
  // ----------------------------------------------------

  const expiresAt = new Date(
    Date.now() + 15 * 60 * 1000
  );

  // ----------------------------------------------------
  // SAVE TOKEN
  // ----------------------------------------------------

  await prisma.user.update({
    where: {
      id: user.id,
    },

    data: {
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: expiresAt,
    },
  });

  // ----------------------------------------------------
  // RESET URL
  // ----------------------------------------------------

  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // ----------------------------------------------------
  // SEND EMAIL
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // VALIDATE PASSWORD
  // ----------------------------------------------------

  if (newPassword.length < 8) {
    throw new AppError(
      "Password must be at least 8 characters",
      400
    );
  }

  // ----------------------------------------------------
  // HASH TOKEN
  // ----------------------------------------------------

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // ----------------------------------------------------
  // FIND USER
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // HASH PASSWORD
  // ----------------------------------------------------

  const hashedPassword =
    await hashPassword(newPassword);

  // ----------------------------------------------------
  // UPDATE PASSWORD
  // ----------------------------------------------------

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

// ======================================================
// UPDATE MY PROFILE
// ======================================================

export const updateMyProfileService = async (
  userId,
  payload,
  files
) => {
  // ----------------------------------------------------
  // FIND USER
  // ----------------------------------------------------

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

  // ----------------------------------------------------
  // ALLOWED FIELDS
  // ----------------------------------------------------

  const {
    fullName,
    email,
    phoneNumber,
    fan,
  } = payload;

  const data = {};

  // ----------------------------------------------------
  // FULL NAME
  // ----------------------------------------------------

  if (fullName !== undefined) {
    const cleanedFullName =
      fullName.trim();

    if (!cleanedFullName) {
      throw new AppError(
        "Full name cannot be empty",
        400
      );
    }

    if (cleanedFullName.length < 3) {
      throw new AppError(
        "Full name should be at least 3 characters",
        400
      );
    }

    data.fullName = cleanedFullName;
  }

  // ----------------------------------------------------
  // EMAIL
  // ----------------------------------------------------

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
      const existingEmail =
        await prisma.user.findUnique({
          where: {
            email: cleanedEmail,
          },
        });

      if (existingEmail) {
        throw new AppError(
          "Email is already registered",
          409
        );
      }

      data.email = cleanedEmail;
    }
  }

  // ----------------------------------------------------
  // PHONE NUMBER
  // ----------------------------------------------------

  if (phoneNumber !== undefined) {
    const cleanedPhone =
      phoneNumber.trim();

    if (!cleanedPhone) {
      throw new AppError(
        "Phone number cannot be empty",
        400
      );
    }

    if (
      !/^(09|07)\d{8}$|^\+251[79]\d{8}$/.test(
        cleanedPhone
      )
    ) {
      throw new AppError(
        "Phone number must be 10 digits starting with 09 or 07, or +251 followed by 9 digits",
        400
      );
    }

    if (
      cleanedPhone !== user.phoneNumber
    ) {
      const existingPhone =
        await prisma.user.findUnique({
          where: {
            phoneNumber: cleanedPhone,
          },
        });

      if (existingPhone) {
        throw new AppError(
          "Phone number is already registered",
          409
        );
      }

      data.phoneNumber = cleanedPhone;
    }
  }

  // ----------------------------------------------------
  // FAN
  // ----------------------------------------------------

  if (fan !== undefined) {
    const cleanedFan =
      fan.trim();

    if (!cleanedFan) {
      throw new AppError(
        "FAN number cannot be empty",
        400
      );
    }

    if (!/^\d{16}$/.test(cleanedFan)) {
      throw new AppError(
        "FAN number should be exactly 16 digits",
        400
      );
    }

    if (cleanedFan !== user.fan) {
      const existingFan =
        await prisma.user.findUnique({
          where: {
            fan: cleanedFan,
          },
        });

      if (existingFan) {
        throw new AppError(
          "FAN number is already registered",
          409
        );
      }

      data.fan = cleanedFan;
    }
  }

  
  // ----------------------------------------------------
  // PROFILE PHOTO
  // ----------------------------------------------------

  if (files?.profilePhoto?.[0]) {
    const result =
      await uploadToCloudinary(
        files.profilePhoto[0].buffer,
        "yekondominium/profile"
      );

    data.profilePhoto =
      result.secure_url;
  }

  // ----------------------------------------------------
  // FRONT ID
  // ----------------------------------------------------

  if (files?.frontId?.[0]) {
    const result =
      await uploadToCloudinary(
        files.frontId[0].buffer,
        "yekondominium/ids"
      );

    data.frontId =
      result.secure_url;
  }

  // ----------------------------------------------------
  // BACK ID
  // ----------------------------------------------------

  if (files?.backId?.[0]) {
    const result =
      await uploadToCloudinary(
        files.backId[0].buffer,
        "yekondominium/ids"
      );

    data.backId =
      result.secure_url;
  }

  // ----------------------------------------------------
  // NOTHING TO UPDATE
  // ----------------------------------------------------

  if (Object.keys(data).length === 0) {
    throw new AppError(
      "No valid profile information was provided",
      400
    );
  }

  // ----------------------------------------------------
  // UPDATE USER
  // ----------------------------------------------------

  const updatedUser =
    await prisma.user.update({
      where: {
        id: String(userId),
      },

      data,

      select: {
        id: true,
        fullName: true,
        email: true,
        fan: true,
        phoneNumber: true,
        role: true,

        condoId: true,
        condoCode: true,

        block: true,
        roomNo: true,

        profilePhoto: true,
        frontId: true,
        backId: true,

        isVerified: true,
        isInIddir: true,
        isInEqub: true,
        isGetEqub: true,

        registerDate: true,
        dueDate: true,

        createdAt: true,
        updatedAt: true,
      },
    });

  return updatedUser;
};