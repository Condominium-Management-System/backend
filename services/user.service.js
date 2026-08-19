import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  updateUserRoleValidation,
  verifyUserValidation,
  updateUserByAdminValidation
} from "../inputValidation/userManagement.validation.js";

import { adminUserSelect } from "../utils/adminUser.js";


// 
// HELPERS
// 

const isSuperAdmin = (user) =>
  user?.role === "super_admin";

const isCondoAdmin = (user) =>
  user?.role === "condo_admin";

const checkCondoAccess = (
  condoId,
  requester
) => {

  if (isSuperAdmin(requester)) {
    return true;
  }

  if (
    !requester?.condoId ||
    requester.condoId !== String(condoId)
  ) {
    throw new AppError(
      "You can only access users inside your condominium",
      403
    );
  }

  return true;
};


// 
// PUBLIC USER SELECT
// 

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
  fan: true,

  addToEqubById: true,
  addToIddirById: true,

  isGetEqub: true,
  isInEqub: true,
  isInIddir: true,

  isVerified: true,

  registerDate: true,
  dueDate: true,

  createdAt: true,
  updatedAt: true
};


// 
// SEARCH USERS
// 

export const searchUsersService = async (
  search,
  condoId,
  requester = null
) => {

  if (!search || !search.trim()) {
    throw new AppError(
      "Search query is required",
      400
    );
  }

  const keyword = search.trim();

  const where = {
    deletedAt: null
  };

  if (isSuperAdmin(requester)) {

    if (condoId) {
      where.condoId = String(condoId);
    }

  } else {

    if (!requester?.condoId) {
      throw new AppError(
        "Condominium access is required",
        403
      );
    }

    where.condoId = requester.condoId;
  }

  const orConditions = [
    {
      fullName: {
        contains: keyword,
        mode: "insensitive"
      }
    },
    {
      email: {
        contains: keyword,
        mode: "insensitive"
      }
    },
    {
      phoneNumber: {
        contains: keyword,
        mode: "insensitive"
      }
    },
    {
      fan: {
        contains: keyword,
        mode: "insensitive"
      }
    },
    {
      block: {
        contains: keyword,
        mode: "insensitive"
      }
    },
    {
      roomNo: {
        contains: keyword,
        mode: "insensitive"
      }
    },
    {
      condoCode: {
        contains: keyword,
        mode: "insensitive"
      }
    },
    {
      condo: {
        condoName: {
          contains: keyword,
          mode: "insensitive"
        }
      }
    }
  ];

  const validRoles = [
    "super_admin",
    "condo_admin",
    "guard",
    "resident"
  ];

  if (
    validRoles.includes(
      keyword.toLowerCase()
    )
  ) {
    orConditions.push({
      role: keyword.toLowerCase()
    });
  }

  if (
    keyword.toLowerCase() === "verified"
  ) {
    orConditions.push({
      isVerified: true
    });
  }

  if (
    keyword.toLowerCase() === "unverified"
  ) {
    orConditions.push({
      isVerified: false
    });
  }

  where.OR = orConditions;

  return prisma.user.findMany({
    where,
    select: adminUserSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
};


// 
// GET ALL USERS BY CONDO
// 

export const getUsersService = async (
  condoId,
  requester,
  filters = {}
) => {

  const where = {
    deletedAt: null
  };

  if (isSuperAdmin(requester)) {

    if (condoId) {
      where.condoId = String(condoId);
    }

  } else {

    if (!requester?.condoId) {
      throw new AppError(
        "Condominium access is required",
        403
      );
    }

    where.condoId = requester.condoId;
  }

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.isVerified !== undefined) {
    where.isVerified = filters.isVerified;
  }

  if (filters.block) {
    where.block = {
      contains: filters.block.trim(),
      mode: "insensitive"
    };
  }

  if (filters.roomNo) {
    where.roomNo = {
      contains: filters.roomNo.trim(),
      mode: "insensitive"
    };
  }

  return prisma.user.findMany({
    where,
    select: adminUserSelect,
    orderBy: {
      createdAt: "desc"
    }
  });
};


// 
// GET USER BY ID
// 

export const getUserByIdService = async (
  condoId,
  userId,
  requester
) => {

  const where = {
    id: String(userId),
    deletedAt: null
  };

  if (isSuperAdmin(requester)) {

    if (condoId) {
      where.condoId = String(condoId);
    }

  } else {

    if (!requester?.condoId) {
      throw new AppError(
        "Condominium access is required",
        403
      );
    }

    where.condoId = requester.condoId;
  }

  const user =
    await prisma.user.findFirst({
      where,
      select: adminUserSelect
    });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  return user;
};


// 
// PUBLIC USER PROFILE
// 

export const getUserProfileService = async (
  userId,
  requester
) => {

  const user =
    await prisma.user.findFirst({

      where: {
        id: String(userId),
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


  // Super admin gets full profile

  if (
    requester?.role === "super_admin"
  ) {
    return user;
  }


  // Condo admin / guard
  // can see full profile

  if (
    requester?.role === "condo_admin" ||
    requester?.role === "guard"
  ) {

    return user;
  }


  // User viewing themselves

  if (
    requester?.id === user.id
  ) {
    return user;
  }


  // Public / normal user

  return {
    id:
      user.id,

    fullName:
      user.fullName,

    role:
      user.role,

    profilePhoto:
      user.profilePhoto,

    email:
      user.email,

    phoneNumber:
      user.phoneNumber
  };
};


// 
// VERIFY USER
// 

export const verifyUserService = async (
  condoId,
  userId,
  payload,
  requester
) => {

  checkCondoAccess(
    condoId,
    requester
  );


  const { error } =
    verifyUserValidation.validate(
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
        condoId,
        deletedAt: null
      }

    });


  if (!user) {
    throw new AppError(
      "User not found in this condominium",
      404
    );
  }


  return prisma.user.update({

    where: {
      id: user.id
    },

    data: {
      isVerified:
        payload.isVerified
    },

    select:
      publicUserSelect

  });
};


// 
// CHANGE USER ROLE
// 

export const updateUserRoleService = async (
  condoId,
  userId,
  payload,
  requester
) => {

  // Only super admin can change roles

  if (!isSuperAdmin(requester)) {
    throw new AppError(
      "Only super admin can change user roles",
      403
    );
  }


  const { error } =
    updateUserRoleValidation.validate(
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
        condoId,
        deletedAt: null
      }

    });


  if (!user) {
    throw new AppError(
      "User not found in this condominium",
      404
    );
  }


  if (
    user.role === payload.role
  ) {
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
      role:
        payload.role
    },

    select:
      publicUserSelect

  });
};


// 
// UPDATE USER BY ADMIN
// 

export const updateUserByAdminService = async (
  condoId,
  userId,
  payload,
  requester
) => {

  checkCondoAccess(
    condoId,
    requester
  );


  const {
    error,
    value
  } =
    updateUserByAdminValidation.validate(
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
        condoId,
        deletedAt: null
      }

    });


  if (!user) {
    throw new AppError(
      "User not found in this condominium",
      404
    );
  }


  const data = {};


  // ====================================================
  // FULL NAME
  // ====================================================

  if (
    value.fullName !== undefined
  ) {

    data.fullName =
      value.fullName;

  }


  // ====================================================
  // EMAIL
  // ====================================================

  if (
    value.email !== undefined &&
    value.email !== user.email
  ) {

    const existing =
      await prisma.user.findUnique({

        where: {
          email:
            value.email
        }

      });


    if (existing) {
      throw new AppError(
        "Email is already registered",
        409
      );
    }


    data.email =
      value.email;
  }


  // ====================================================
  // PHONE
  // ====================================================

  if (
    value.phoneNumber !== undefined &&
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


    data.phoneNumber =
      value.phoneNumber;
  }


  // ====================================================
  // FAN
  // ====================================================

  if (
    value.fan !== undefined &&
    value.fan !== user.fan
  ) {

    const existing =
      await prisma.user.findUnique({

        where: {
          fan:
            value.fan
        }

      });


    if (existing) {
      throw new AppError(
        "FAN number is already registered",
        409
      );
    }


    data.fan =
      value.fan;
  }


  // ====================================================
  // ROLE
  // ====================================================

  if (
    value.role !== undefined
  ) {

    if (
      !isSuperAdmin(requester)
    ) {
      throw new AppError(
        "Only super admin can change user roles",
        403
      );
    }


    data.role =
      value.role;
  }


  // ====================================================
  // CONDO
  // ====================================================

  // Only super admin can move a user
  // to another condominium.

  if (
    value.condoId !== undefined
  ) {

    if (
      !isSuperAdmin(requester)
    ) {
      throw new AppError(
        "Only super admin can change condominium assignment",
        403
      );
    }


    const condo =
      await prisma.condo.findFirst({

        where: {
          id:
            value.condoId,

          deletedAt:
            null
        }

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


  // ====================================================
  // BLOCK
  // ====================================================

  if (
    value.block !== undefined
  ) {

    data.block =
      value.block;
  }


  // ====================================================
  // ROOM
  // ====================================================

  if (
    value.roomNo !== undefined
  ) {

    data.roomNo =
      value.roomNo;
  }


  // ====================================================
  // DUE DATE
  // ====================================================

  if (
    value.dueDate !== undefined
  ) {

    data.dueDate =
      value.dueDate;
  }


  // ====================================================
  // VERIFIED
  // ====================================================

  if (
    value.isVerified !== undefined
  ) {

    data.isVerified =
      value.isVerified;
  }


  if (
    Object.keys(data).length === 0
  ) {
    throw new AppError(
      "No valid information was provided",
      400
    );
  }


  return prisma.user.update({

    where: {
      id:
        user.id
    },

    data,

    select:
      publicUserSelect

  });
};


// 
// DELETE USER
// 

export const deleteUserService = async (
  condoId,
  userId,
  requester
) => {

  checkCondoAccess(
    condoId,
    requester
  );


  const user =
    await prisma.user.findFirst({

      where: {
        id:
          String(userId),

        condoId,

        deletedAt:
          null
      }

    });


  if (!user) {
    throw new AppError(
      "User not found in this condominium",
      404
    );
  }


  await prisma.user.update({

    where: {
      id:
        user.id
    },

    data: {
      deletedAt:
        new Date()
    }

  });


  return {
    deleted: true
  };
};


// 
// RESTORE USER
// 

export const restoreUserService = async (
  condoId,
  userId,
  requester
) => {

  // Only super admin

  if (
    !isSuperAdmin(requester)
  ) {
    throw new AppError(
      "Only super admin can restore users",
      403
    );
  }


  const user =
    await prisma.user.findFirst({

      where: {
        id:
          String(userId),

        condoId
      }

    });


  if (!user) {
    throw new AppError(
      "User not found in this condominium",
      404
    );
  }


  if (!user.deletedAt) {
    throw new AppError(
      "User is not deleted",
      400
    );
  }


  return prisma.user.update({

    where: {
      id:
        user.id
    },

    data: {
      deletedAt:
        null
    },

    select:
      adminUserSelect

  });
};