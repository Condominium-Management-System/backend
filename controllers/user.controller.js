import AppError from "../errorhandler/AppError.js";

import {
  getAllUsersService,
  getUserByIdService,
  getUserProfileService,
  verifyUserService,
  updateUserRoleService,
  updateUserByAdminService,
  deleteUserService
} from "../services/user.service.js";


// GET ALL USERS

export const getAllUsers = async (
  req,
  res,
  next
) => {

  try {

    const users =
      await getAllUsersService({
        condoId: req.query.condoId,
        role: req.query.role,
        isVerified:
          req.query.isVerified !== undefined
            ? req.query.isVerified === "true"
            : undefined
      });

    res.status(200).json({
      success: true,
      data: users
    });

  } catch (error) {
    next(error);
  }
};


// GET USER BY ID

export const getUserById = async (
  req,
  res,
  next
) => {

  try {

    const user =
      await getUserByIdService(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};


// VIEW PROFILE

export const getUserProfile = async (
  req,
  res,
  next
) => {

  try {

    const user =
      await getUserProfileService(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    next(error);
  }
};


// VERIFY USER

export const verifyUser = async (
  req,
  res,
  next
) => {

  try {

    const user =
      await verifyUserService(
        req.params.id,
        req.body,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "User verification updated",
      data: user
    });

  } catch (error) {
    next(error);
  }
};


// UPDATE ROLE

export const updateUserRole = async (
  req,
  res,
  next
) => {

  try {

    const user =
      await updateUserRoleService(
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user
    });

  } catch (error) {
    next(error);
  }
};


// ADMIN UPDATE USER

export const updateUserByAdmin = async (
  req,
  res,
  next
) => {

  try {

    const user =
      await updateUserByAdminService(
        req.params.id,
        req.body,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user
    });

  } catch (error) {
    next(error);
  }
};


// DELETE USER

export const deleteUser = async (
  req,
  res,
  next
) => {

  try {

    const result =
      await deleteUserService(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result
    });

  } catch (error) {
    next(error);
  }
};