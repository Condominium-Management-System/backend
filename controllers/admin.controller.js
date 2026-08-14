import AppError from "../errorhandler/AppError.js";

import {
  getDashboardStatsService,
  getUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  restoreUserService,
  verifyUserService,
  updateUserRoleService,
  assignUserCondoService,
} from "../services/admin.service.js";


// DASHBOARD

export const getDashboardStats =
  async (req, res, next) => {

    try {

      const stats =
        await getDashboardStatsService(
          req.user
        );

      res.status(200).json({
        success: true,

        data: stats,
      });

    } catch (error) {
      next(error);
    }
  };


// GET USERS

export const getUsers =
  async (req, res, next) => {

    try {

      const result =
        await getUsersService(
          req.user,
          req.query
        );

      res.status(200).json({
        success: true,

        ...result,
      });

    } catch (error) {
      next(error);
    }
  };


// GET USER

export const getUserById =
  async (req, res, next) => {

    try {

      const user =
        await getUserByIdService(
          req.user,
          req.params.id
        );

      res.status(200).json({
        success: true,

        data: user,
      });

    } catch (error) {
      next(error);
    }
  };


// CREATE USER

export const createUser =
  async (req, res, next) => {

    try {

      const user =
        await createUserService(
          req.user,
          req.body
        );

      res.status(201).json({
        success: true,

        message:
          "User created successfully",

        data: user,
      });

    } catch (error) {
      next(error);
    }
  };


// UPDATE USER

export const updateUser =
  async (req, res, next) => {

    try {

      const user =
        await updateUserService(
          req.user,
          req.params.id,
          req.body
        );

      res.status(200).json({
        success: true,

        message:
          "User updated successfully",

        data: user,
      });

    } catch (error) {
      next(error);
    }
  };


// DELETE USER

export const deleteUser =
  async (req, res, next) => {

    try {

      const result =
        await deleteUserService(
          req.user,
          req.params.id
        );

      res.status(200).json({
        success: true,

        message:
          "User deleted successfully",

        data: result,
      });

    } catch (error) {
      next(error);
    }
  };


// RESTORE USER

export const restoreUser =
  async (req, res, next) => {

    try {

      const user =
        await restoreUserService(
          req.user,
          req.params.id
        );

      res.status(200).json({
        success: true,

        message:
          "User restored successfully",

        data: user,
      });

    } catch (error) {
      next(error);
    }
  };


// VERIFY

export const verifyUser =
  async (req, res, next) => {

    try {

      const user =
        await verifyUserService(
          req.user,
          req.params.id,
          req.body
        );

      res.status(200).json({
        success: true,

        message:
          "User verification status updated",

        data: user,
      });

    } catch (error) {
      next(error);
    }
  };


// ROLE

export const updateUserRole =
  async (req, res, next) => {

    try {

      const user =
        await updateUserRoleService(
          req.user,
          req.params.id,
          req.body
        );

      res.status(200).json({
        success: true,

        message:
          "User role updated successfully",

        data: user,
      });

    } catch (error) {
      next(error);
    }
  };


// MOVE USER TO CONDO

export const assignUserCondo =
  async (req, res, next) => {

    try {

      const {
        condoId,
      } = req.body;


      if (!condoId) {
        throw new AppError(
          "condoId is required",
          400
        );
      }


      const user =
        await assignUserCondoService(
          req.user,
          req.params.id,
          condoId
        );


      res.status(200).json({
        success: true,

        message:
          "User assigned to condominium successfully",

        data: user,
      });

    } catch (error) {
      next(error);
    }
  };