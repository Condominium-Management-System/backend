import asyncHandler from "../utils/asyncHandler.js";

import {
  getUsersService,
  searchUsersService,
  getUserByIdService,
  getUserProfileService,
  verifyUserService,
  updateUserRoleService,
  updateUserByAdminService,
  deleteUserService,
  restoreUserService
} from "../services/user.service.js";



// GET ALL USERS BY CONDOMINIUM


export const getAllUsers = asyncHandler(
  async (req, res) => {

    const users =
      await getUsersService(
        req.params.condoId || null,
        req.user,
        {
          role:
            req.query.role,

          isVerified:
            req.query.isVerified !== undefined
              ? req.query.isVerified === "true"
              : undefined,

          block:
            req.query.block,

          roomNo:
            req.query.roomNo
        }
      );

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  }
);



// SEARCH USERS BY CONDOMINIUM


export const searchUsers = asyncHandler(
  async (req, res) => {

    const users =
      await searchUsersService(
        req.query.search,
        req.params.condoId || null,
        req.user
      );

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  }
);



// GET USER BY ID


export const getUserById = asyncHandler(
  async (req, res) => {

    const user =
      await getUserByIdService(
        req.params.condoId || null,
        req.params.userId,
        req.user
      );

    res.status(200).json({
      success: true,
      data: user
    });
  }
);


// PUBLIC USER PROFILE


export const getUserProfile = asyncHandler(
  async (req, res) => {

    const {
      userId
    } = req.params;


    const user =
      await getUserProfileService(
        userId,
        req.user
      );


    res.status(200).json({
      success: true,
      data: user
    });

  }
);



// vERIFY USER


export const verifyUser = asyncHandler(
  async (req, res) => {

    const {
      condoId,
      userId
    } = req.params;


    const user =
      await verifyUserService(
        condoId,
        userId,
        req.body,
        req.user
      );


    res.status(200).json({
      success: true,
      message:
        "User verification updated",
      data: user
    });

  }
);



// UPDATE USER ROLE


export const updateUserRole = asyncHandler(
  async (req, res) => {

    const {
      condoId,
      userId
    } = req.params;


    const user =
      await updateUserRoleService(
        condoId,
        userId,
        req.body,
        req.user
      );


    res.status(200).json({
      success: true,
      message:
        "User role updated successfully",
      data: user
    });

  }
);



// UPDATE USER BY ADMIN


export const updateUserByAdmin = asyncHandler(
  async (req, res) => {

    const {
      condoId,
      userId
    } = req.params;


    const user =
      await updateUserByAdminService(
        condoId,
        userId,
        req.body,
        req.user
      );


    res.status(200).json({
      success: true,
      message:
        "User updated successfully",
      data: user
    });

  }
);



// DELETE USER


export const deleteUser = asyncHandler(
  async (req, res) => {

    const {
      condoId,
      userId
    } = req.params;


    const result =
      await deleteUserService(
        condoId,
        userId,
        req.user
      );


    res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
      data: result
    });

  }
);



// RESTORE USER


export const restoreUser = asyncHandler(
  async (req, res) => {

    const {
      condoId,
      userId
    } = req.params;


    const user =
      await restoreUserService(
        condoId,
        userId,
        req.user
      );


    res.status(200).json({
      success: true,
      message:
        "User restored successfully",
      data: user
    });

  }
);