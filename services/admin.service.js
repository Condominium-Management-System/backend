import AppError from "../errorhandler/AppError.js";

import { prisma } from "../config/prisma.config.js";

import {
  hashPassword,
} from "../utils/password.js";

import {
  adminUserSelect,
} from "../utils/adminUser.js";

import {
  adminCreateUserValidation,
  adminUpdateUserValidation,
  updateRoleValidation,
  verifyUserValidation,
} from "../inputValidation/admin.validation.js";


// HELPER

const isSuperAdmin = (user) => {
  return user?.role === "super_admin";
};


const isCondoAdmin = (user) => {
  return user?.role === "condo_admin";
};


// CHECK ADMIN ACCESS TO USER

const checkUserAccess = async (
  currentUser,
  targetUser
) => {

  if (!targetUser) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (targetUser.deletedAt) {
    throw new AppError(
      "User has been deleted",
      404
    );
  }


  // Super admin can access everyone

  if (isSuperAdmin(currentUser)) {
    return true;
  }


  // Condo admin can only access
  // users inside own condo

  if (isCondoAdmin(currentUser)) {

    if (
      !currentUser.condoId ||
      currentUser.condoId !== targetUser.condoId
    ) {
      throw new AppError(
        "You can only manage users inside your condominium",
        403
      );
    }

    return true;
  }


  throw new AppError(
    "You do not have permission to manage users",
    403
  );
};


// DASHBOARD STATISTICS

export const getDashboardStatsService =
  async (currentUser) => {

    const condoFilter =
      isSuperAdmin(currentUser)
        ? {}
        : {
            condoId: currentUser.condoId,
          };


    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      residents,
      guards,
      condoAdmins,
      condos,
      blocks,
      rooms,
      occupiedRooms,
      freeRooms,
      pendingPayments,
      totalPayments,
    ] = await Promise.all([

      // USERS

      prisma.user.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      prisma.user.count({
        where: {
          ...condoFilter,
          deletedAt: null,
          isVerified: true,
        },
      }),

      prisma.user.count({
        where: {
          ...condoFilter,
          deletedAt: null,
          isVerified: false,
        },
      }),

      prisma.user.count({
        where: {
          ...condoFilter,
          deletedAt: null,
          role: "resident",
        },
      }),

      prisma.user.count({
        where: {
          ...condoFilter,
          deletedAt: null,
          role: "guard",
        },
      }),

      prisma.user.count({
        where: {
          ...condoFilter,
          deletedAt: null,
          role: "condo_admin",
        },
      }),

      // CONDOS

      isSuperAdmin(currentUser)
        ? prisma.condo.count({
            where: {
              deletedAt: null,
            },
          })
        : Promise.resolve(1),

      // BLOCKS

      prisma.block.count({
        where: {
          ...(isSuperAdmin(currentUser)
            ? {}
            : {
                condoId:
                  currentUser.condoId,
              }),

          deletedAt: null,
        },
      }),

      // ROOMS

      prisma.room.count({
        where: {
          ...(isSuperAdmin(currentUser)
            ? {}
            : {
                condoId:
                  currentUser.condoId,
              }),

          deletedAt: null,
        },
      }),

      prisma.room.count({
        where: {
          ...(isSuperAdmin(currentUser)
            ? {}
            : {
                condoId:
                  currentUser.condoId,
              }),

          status: "occupied",

          deletedAt: null,
        },
      }),

      prisma.room.count({
        where: {
          ...(isSuperAdmin(currentUser)
            ? {}
            : {
                condoId:
                  currentUser.condoId,
              }),

          status: "free",

          deletedAt: null,
        },
      }),

      // PAYMENTS

      prisma.payment.count({
        where: {
          ...(isSuperAdmin(currentUser)
            ? {}
            : {
                condoId:
                  currentUser.condoId,
              }),

          status: "pending",

          deletedAt: null,
        },
      }),

      prisma.payment.count({
        where: {
          ...(isSuperAdmin(currentUser)
            ? {}
            : {
                condoId:
                  currentUser.condoId,
              }),

          deletedAt: null,
        },
      }),
    ]);


    return {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,

        residents,
        guards,
        condoAdmins,
      },

      condos,

      blocks,

      rooms: {
        total: rooms,
        occupied: occupiedRooms,
        free: freeRooms,
      },

      payments: {
        total: totalPayments,
        pending: pendingPayments,
      },
    };
  };


// GET USERS

export const getUsersService =
  async (currentUser, query = {}) => {

    const {
      search,
      role,
      verified,
      page = 1,
      limit = 20,
    } = query;


    const pageNumber =
      Math.max(
        Number(page) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number(limit) || 20,
          1
        ),
        100
      );


    const where = {
      deletedAt: null,
    };


    // Condo restriction

    if (!isSuperAdmin(currentUser)) {

      where.condoId =
        currentUser.condoId;
    }


    // Search

    if (search) {

      where.OR = [
        {
          fullName: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          phoneNumber: {
            contains: search,
            mode: "insensitive",
          },
        },

        {
          fan: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }


    // Role filter

    if (role) {
      where.role = role;
    }


    // Verification filter

    if (verified !== undefined) {

      if (
        verified === true ||
        verified === "true"
      ) {
        where.isVerified = true;
      }

      if (
        verified === false ||
        verified === "false"
      ) {
        where.isVerified = false;
      }
    }


    const skip =
      (pageNumber - 1) *
      limitNumber;


    const [
      users,
      total,
    ] = await Promise.all([

      prisma.user.findMany({
        where,

        select:
          adminUserSelect,

        orderBy: {
          createdAt: "desc",
        },

        skip,

        take: limitNumber,
      }),

      prisma.user.count({
        where,
      }),
    ]);


    return {
      users,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages:
          Math.ceil(
            total /
              limitNumber
          ),
      },
    };
  };


// GET ONE USER

export const getUserByIdService =
  async (
    currentUser,
    userId
  ) => {

    const targetUser =
      await prisma.user.findFirst({
        where: {
          id: String(userId),

          deletedAt: null,
        },

        select:
          adminUserSelect,
      });


    await checkUserAccess(
      currentUser,
      targetUser
    );


    return targetUser;
  };


// CREATE USER BY ADMIN

export const createUserService =
  async (
    currentUser,
    payload
  ) => {

    const {
      error,
      value,
    } =
      adminCreateUserValidation.validate(
        payload,
        {
          abortEarly: true,
          stripUnknown: true,
        }
      );


    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }


    // Condo admin can only create
    // inside own condominium

    if (
      isCondoAdmin(currentUser)
    ) {

      if (
        value.condoId !==
        currentUser.condoId
      ) {
        throw new AppError(
          "You can only create users in your condominium",
          403
        );
      }


      // Condo admin cannot create
      // another condo admin

      if (
        value.role ===
        "condo_admin"
      ) {
        throw new AppError(
          "Only super admin can promote users to condominium admin",
          403
        );
      }
    }


    // Check condo

    const condo =
      await prisma.condo.findFirst({
        where: {
          id: value.condoId,

          deletedAt: null,

          activeStatus: true,
        },
      });


    if (!condo) {
      throw new AppError(
        "Active condominium not found",
        404
      );
    }


    // Unique email

    const emailExists =
      await prisma.user.findUnique({
        where: {
          email:
            value.email
              .trim()
              .toLowerCase(),
        },
      });


    if (emailExists) {
      throw new AppError(
        "Email is already registered",
        409
      );
    }


    // Unique phone

    const phoneExists =
      await prisma.user.findUnique({
        where: {
          phoneNumber:
            value.phoneNumber.trim(),
        },
      });


    if (phoneExists) {
      throw new AppError(
        "Phone number is already registered",
        409
      );
    }


    // Unique FAN

    const fanExists =
      await prisma.user.findUnique({
        where: {
          fan:
            value.fan.trim(),
        },
      });


    if (fanExists) {
      throw new AppError(
        "FAN number is already registered",
        409
      );
    }


    const password =
      await hashPassword(
        value.password
      );


    const user =
      await prisma.user.create({
        data: {

          fullName:
            value.fullName.trim(),

          email:
            value.email
              .trim()
              .toLowerCase(),

          phoneNumber:
            value.phoneNumber.trim(),

          password,

          fan:
            value.fan.trim(),

          condoId:
            condo.id,

          condoCode:
            condo.condoCode,

          block:
            value.block || null,

          roomNo:
            value.roomNo || null,

          role:
            value.role || "resident",

          isVerified:
            value.isVerified ?? false,

          privacySettings: {
            showPhoneNumber: true,
            showEmail: false,
            showProfilePhoto: true,
            showBlock: false,
            showRoomNo: false,
          },
        },

        select:
          adminUserSelect,
      });


    return user;
  };


// UPDATE USER

export const updateUserService =
  async (
    currentUser,
    userId,
    payload
  ) => {

    const targetUser =
      await prisma.user.findFirst({
        where: {
          id: String(userId),
          deletedAt: null,
        },
      });


    await checkUserAccess(
      currentUser,
      targetUser
    );


    const {
      error,
      value,
    } =
      adminUpdateUserValidation.validate(
        payload,
        {
          abortEarly: true,
          stripUnknown: true,
        }
      );


    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }


    // ---------------------------------------------
    // ROLE PROTECTION
    // ---------------------------------------------

    if (
      value.role !== undefined &&
      value.role !== targetUser.role
    ) {

      if (
        !isSuperAdmin(currentUser)
      ) {

        throw new AppError(
          "Only super admin can change user roles",
          403
        );
      }
    }


    // ---------------------------------------------
    // CONDO PROTECTION
    // ---------------------------------------------

    if (
      isCondoAdmin(currentUser)
    ) {

      if (
        value.condoId &&
        value.condoId !==
          currentUser.condoId
      ) {
        throw new AppError(
          "You cannot move a user to another condominium",
          403
        );
      }
    }


    const data = {};


    // ---------------------------------------------
    // BASIC FIELDS
    // ---------------------------------------------

    if (
      value.fullName !== undefined
    ) {
      data.fullName =
        value.fullName.trim();
    }


    // ---------------------------------------------
    // EMAIL
    // ---------------------------------------------

    if (
      value.email !== undefined
    ) {

      const email =
        value.email
          .trim()
          .toLowerCase();


      if (
        email !== targetUser.email
      ) {

        const exists =
          await prisma.user.findUnique({
            where: {
              email,
            },
          });


        if (exists) {
          throw new AppError(
            "Email is already registered",
            409
          );
        }


        data.email = email;
      }
    }


    // ---------------------------------------------
    // PHONE
    // ---------------------------------------------

    if (
      value.phoneNumber !== undefined
    ) {

      const phone =
        value.phoneNumber.trim();


      if (
        phone !==
        targetUser.phoneNumber
      ) {

        const exists =
          await prisma.user.findUnique({
            where: {
              phoneNumber: phone,
            },
          });


        if (exists) {
          throw new AppError(
            "Phone number is already registered",
            409
          );
        }


        data.phoneNumber = phone;
      }
    }


    // ---------------------------------------------
    // FAN
    // ---------------------------------------------

    if (
      value.fan !== undefined
    ) {

      const fan =
        value.fan.trim();


      if (
        fan !== targetUser.fan
      ) {

        const exists =
          await prisma.user.findUnique({
            where: {
              fan,
            },
          });


        if (exists) {
          throw new AppError(
            "FAN number is already registered",
            409
          );
        }


        data.fan = fan;
      }
    }


    // ---------------------------------------------
    // PASSWORD
    // ---------------------------------------------

    if (
      value.password !== undefined
    ) {

      data.password =
        await hashPassword(
          value.password
        );

      data.refreshToken = null;
    }


    // ---------------------------------------------
    // CONDO
    // ---------------------------------------------

    if (
      value.condoId !== undefined
    ) {

      const condo =
        await prisma.condo.findFirst({
          where: {
            id:
              value.condoId,

            deletedAt: null,
          },
        });


      if (!condo) {
        throw new AppError(
          "Condominium not found",
          404
        );
      }


      data.condoId =
        condo.id;

      data.condoCode =
        condo.condoCode;
    }


    // ---------------------------------------------
    // BLOCK
    // ---------------------------------------------

    if (
      value.block !== undefined
    ) {
      data.block =
        value.block || null;
    }


    // ---------------------------------------------
    // ROOM
    // ---------------------------------------------

    if (
      value.roomNo !== undefined
    ) {
      data.roomNo =
        value.roomNo || null;
    }


    // ---------------------------------------------
    // ROLE
    // ---------------------------------------------

    if (
      value.role !== undefined
    ) {
      data.role =
        value.role;
    }


    // ---------------------------------------------
    // VERIFIED
    // ---------------------------------------------

    if (
      value.isVerified !== undefined
    ) {
      data.isVerified =
        value.isVerified;
    }


    // ---------------------------------------------
    // DUE DATE
    // ---------------------------------------------

    if (
      value.dueDate !== undefined
    ) {
      data.dueDate =
        value.dueDate;
    }


    // ---------------------------------------------
    // PRIVACY
    // ---------------------------------------------

    if (
      value.privacySettings !==
      undefined
    ) {

      data.privacySettings =
        value.privacySettings;
    }


    if (
      Object.keys(data).length === 0
    ) {
      throw new AppError(
        "No valid information was provided",
        400
      );
    }


    const updatedUser =
      await prisma.user.update({
        where: {
          id:
            String(userId),
        },

        data,

        select:
          adminUserSelect,
      });


    return updatedUser;
  };


// DELETE USER

export const deleteUserService =
  async (
    currentUser,
    userId
  ) => {

    const targetUser =
      await prisma.user.findFirst({
        where: {
          id: String(userId),

          deletedAt: null,
        },
      });


    await checkUserAccess(
      currentUser,
      targetUser
    );


    // Nobody can delete super admin
    // through this endpoint.

    if (
      targetUser.role ===
      "super_admin"
    ) {

      throw new AppError(
        "Super admin cannot be deleted through this endpoint",
        403
      );
    }


    // Condo admin cannot delete
    // another condo admin.

    if (
      isCondoAdmin(currentUser) &&
      targetUser.role ===
        "condo_admin"
    ) {

      throw new AppError(
        "Condo admin cannot delete another condo admin",
        403
      );
    }


    await prisma.user.update({
      where: {
        id: String(userId),
      },

      data: {
        deletedAt:
          new Date(),

        refreshToken:
          null,
      },
    });


    return {
      deleted: true,
    };
  };


// RESTORE USER

export const restoreUserService =
  async (
    currentUser,
    userId
  ) => {

    if (
      !isSuperAdmin(currentUser)
    ) {
      throw new AppError(
        "Only super admin can restore users",
        403
      );
    }


    const user =
      await prisma.user.findUnique({
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


    if (!user.deletedAt) {
      throw new AppError(
        "User is not deleted",
        400
      );
    }


    const restored =
      await prisma.user.update({
        where: {
          id: String(userId),
        },

        data: {
          deletedAt: null,
        },

        select:
          adminUserSelect,
      });


    return restored;
  };


// VERIFY USER

export const verifyUserService =
  async (
    currentUser,
    userId,
    payload
  ) => {

    const {
      error,
      value,
    } =
      verifyUserValidation.validate(
        payload
      );


    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }


    const targetUser =
      await prisma.user.findFirst({
        where: {
          id: String(userId),

          deletedAt: null,
        },
      });


    await checkUserAccess(
      currentUser,
      targetUser
    );


    const updated =
      await prisma.user.update({
        where: {
          id: String(userId),
        },

        data: {
          isVerified:
            value.isVerified,
        },

        select:
          adminUserSelect,
      });


    return updated;
  };


// PROMOTE / DEMOTE USER

export const updateUserRoleService =
  async (
    currentUser,
    userId,
    payload
  ) => {

    if (
      !isSuperAdmin(currentUser)
    ) {
      throw new AppError(
        "Only super admin can promote or demote users",
        403
      );
    }


    const {
      error,
      value,
    } =
      updateRoleValidation.validate(
        payload
      );


    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }


    const user =
      await prisma.user.findFirst({
        where: {
          id: String(userId),

          deletedAt: null,
        },
      });


    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }


    // Cannot modify super admin

    if (
      user.role ===
      "super_admin"
    ) {
      throw new AppError(
        "Super admin role cannot be changed",
        403
      );
    }


    // Condo admin must have a condo

    if (
      value.role ===
        "condo_admin" &&
      !user.condoId
    ) {
      throw new AppError(
        "A condominium admin must belong to a condominium",
        400
      );
    }


    const updated =
      await prisma.user.update({
        where: {
          id: String(userId),
        },

        data: {
          role:
            value.role,
        },

        select:
          adminUserSelect,
      });


    return updated;
  };


// ASSIGN USER TO CONDO

export const assignUserCondoService =
  async (
    currentUser,
    userId,
    condoId
  ) => {

    if (
      !isSuperAdmin(currentUser)
    ) {
      throw new AppError(
        "Only super admin can move users between condominiums",
        403
      );
    }


    const user =
      await prisma.user.findFirst({
        where: {
          id: String(userId),

          deletedAt: null,
        },
      });


    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }


    const condo =
      await prisma.condo.findFirst({
        where: {
          id: condoId,

          deletedAt: null,

          activeStatus: true,
        },
      });


    if (!condo) {
      throw new AppError(
        "Active condominium not found",
        404
      );
    }


    return prisma.user.update({
      where: {
        id: String(userId),
      },

      data: {
        condoId:
          condo.id,

        condoCode:
          condo.condoCode,
      },

      select:
        adminUserSelect,
    });
  };