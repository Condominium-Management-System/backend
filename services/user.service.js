import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";
import {
  hashPassword
} from "../utils/password.js";

import {
  updateUserRoleValidation,
  verifyUserValidation,
  updateUserByAdminValidation
} from "../inputValidation/userManagement.validation.js";


// PUBLIC USER PROFILE

const publicUserSelect = {
  id: true,
  fullName: true,
  role: true,
  profilePhoto: true,
  phoneNumber: true,
  email: true,
  condoId: true,
  condoCode: true,
  block: true,
  roomNo: true,
  isVerified: true,
  registerDate: true,
  createdAt: true,
  updatedAt: true
};


// GET ALL USERS

export const getAllUsersService = async ({
  condoId,
  role,
  isVerified
} = {}) => {

  const where = {
    deletedAt: null
  };

  if (condoId) {
    where.condoId = condoId;
  }

  if (role) {
    where.role = role;
  }

  if (isVerified !== undefined) {
    where.isVerified = isVerified;
  }

  return prisma.user.findMany({
    where,

    select: publicUserSelect,

    orderBy: {
      createdAt: "desc"
    }
  });
};


// GET USER BY ID

export const getUserByIdService = async (userId) => {

  const user = await prisma.user.findFirst({
    where: {
      id: String(userId),
      deletedAt: null
    },

    select: publicUserSelect
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  return user;
};


// GET USER PROFILE

export const getUserProfileService = async (
  targetUserId,
  requester
) => {

  const user = await prisma.user.findFirst({
    where: {
      id: String(targetUserId),
      deletedAt: null
    },

    select: {
      id: true,
      fullName: true,
      role: true,

      profilePhoto: true,

      email: true,
      phoneNumber: true,

      condoId: true,
      condoCode: true,

      block: true,
      roomNo: true,

      isVerified: true,

      createdAt: true
    }
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }


  // ADMIN / GUARD / SUPER ADMIN

  if (
    requester.role === "super_admin" ||
    requester.role === "condo_admin" ||
    requester.role === "guard"
  ) {
    return user;
  }


  // USER VIEWING THEMSELVES

  if (requester.id === user.id) {
    return user;
  }


  // NORMAL USER -> OTHER USER

  return {
    id: user.id,
    fullName: user.fullName,
    role: user.role,
    profilePhoto: user.profilePhoto,
    email: user.email,
    phoneNumber: user.phoneNumber
  };
};


// VERIFY USER

export const verifyUserService = async (
  userId,
  payload,
  requester
) => {

  const { error } =
    verifyUserValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const user = await prisma.user.findFirst({
    where: {
      id: String(userId),
      deletedAt: null
    }
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }


  // CONDO ADMIN CAN ONLY VERIFY USERS IN THEIR CONDO

  if (requester.role === "condo_admin") {

    if (user.condoId !== requester.condoId) {
      throw new AppError(
        "You cannot verify a user from another condominium",
        403
      );
    }
  }


  return prisma.user.update({
    where: {
      id: user.id
    },

    data: {
      isVerified: payload.isVerified
    },

    select: publicUserSelect
  });
};


// CHANGE USER ROLE

export const updateUserRoleService = async (
  userId,
  payload
) => {

  const { error } =
    updateUserRoleValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const user = await prisma.user.findFirst({
    where: {
      id: String(userId),
      deletedAt: null
    }
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }


  // Prevent unnecessary update

  if (user.role === payload.role) {
    throw new AppError(
      `User is already ${payload.role}`,
      409
    );
  }


  return prisma.user.update({
    where: {
      id: user.id
    },

    data: {
      role: payload.role
    },

    select: publicUserSelect
  });
};


// UPDATE USER BY ADMIN

export const updateUserByAdminService = async (
  userId,
  payload,
  requester
) => {

  const { error, value } =
    updateUserByAdminValidation.validate(
      payload
    );

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const user = await prisma.user.findFirst({
    where: {
      id: String(userId),
      deletedAt: null
    }
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }


  // CONDO ADMIN SCOPE

  if (requester.role === "condo_admin") {

    if (user.condoId !== requester.condoId) {
      throw new AppError(
        "You cannot modify a user from another condominium",
        403
      );
    }

    if (
      value.role === "super_admin"
    ) {
      throw new AppError(
        "Condo admin cannot promote a user to super admin",
        403
      );
    }
  }


  const data = {};


  // FULL NAME

  if (value.fullName !== undefined) {
    data.fullName = value.fullName;
  }


  // EMAIL

  if (value.email !== undefined) {

    if (value.email !== user.email) {

      const existing =
        await prisma.user.findUnique({
          where: {
            email: value.email
          }
        });

      if (existing) {
        throw new AppError(
          "Email is already registered",
          409
        );
      }
    }

    data.email = value.email;
  }


  // PHONE

  if (value.phoneNumber !== undefined) {

    if (
      value.phoneNumber !== user.phoneNumber
    ) {

      const existing =
        await prisma.user.findUnique({
          where: {
            phoneNumber:
              value.phoneNumber
          }
        });

      if (existing) {
        throw new AppError(
          "Phone number is already registered",
          409
        );
      }
    }

    data.phoneNumber =
      value.phoneNumber;
  }


  // FAN

  if (value.fan !== undefined) {

    if (value.fan !== user.fan) {

      const existing =
        await prisma.user.findUnique({
          where: {
            fan: value.fan
          }
        });

      if (existing) {
        throw new AppError(
          "FAN number is already registered",
          409
        );
      }
    }

    data.fan = value.fan;
  }


  // ROLE

  if (value.role !== undefined) {

    if (
      requester.role !== "super_admin"
    ) {
      throw new AppError(
        "Only super admin can change user roles",
        403
      );
    }

    data.role = value.role;
  }


  // CONDO

  if (value.condoId !== undefined) {

    if (
      requester.role !== "super_admin"
    ) {
      throw new AppError(
        "Only super admin can change condominium assignment",
        403
      );
    }

    const condo =
      await prisma.condo.findFirst({
        where: {
          id: value.condoId,
          deletedAt: null
        }
      });

    if (!condo) {
      throw new AppError(
        "Condominium not found",
        404
      );
    }

    data.condoId = condo.id;
    data.condoCode = condo.condoCode;
  }


  // BLOCK

  if (value.block !== undefined) {
    data.block = value.block;
  }


  // ROOM

  if (value.roomNo !== undefined) {
    data.roomNo = value.roomNo;
  }


  // VERIFIED

  if (value.isVerified !== undefined) {
    data.isVerified = value.isVerified;
  }


  if (Object.keys(data).length === 0) {
    throw new AppError(
      "No valid information was provided",
      400
    );
  }


  return prisma.user.update({
    where: {
      id: user.id
    },

    data,

    select: publicUserSelect
  });
};


// DELETE USER

export const deleteUserService = async (
  userId,
  requester
) => {

  const user = await prisma.user.findFirst({
    where: {
      id: String(userId),
      deletedAt: null
    }
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }


  // Condo admin can only delete
  // users in their condominium

  if (
    requester.role === "condo_admin" &&
    user.condoId !== requester.condoId
  ) {
    throw new AppError(
      "You cannot delete a user from another condominium",
      403
    );
  }


  await prisma.user.update({
    where: {
      id: user.id
    },

    data: {
      deletedAt: new Date()
    }
  });


  return {
    deleted: true
  };
};