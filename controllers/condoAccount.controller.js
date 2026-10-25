// express backend/backend/controllers/condoAccount.controller.js
import {
  getCondoAccountsService,
  getCondoAccountByIdService,
  createCondoAccountService,
  updateCondoAccountService,
  deleteCondoAccountService,
  setDefaultCondoAccountService,
} from "../services/condoAccount.service.js";
import AppError from "../errorhandler/AppError.js";

export const getCondoAccounts = async (req, res, next) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(req.user.role)) {
      throw new AppError("Only authorized administrators can access condominium source accounts", 403);
    }
    const accounts = await getCondoAccountsService(req.user, req.query.condoId);
    res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getCondoAccountById = async (req, res, next) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(req.user.role)) {
      throw new AppError("Only authorized administrators can access condominium source accounts", 403);
    }
    const account = await getCondoAccountByIdService(req.user, req.params.id);
    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const createCondoAccount = async (req, res, next) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(req.user.role)) {
      throw new AppError("Only authorized administrators can register condominium source accounts", 403);
    }
    const account = await createCondoAccountService(req.user, req.body);
    res.status(201).json({
      success: true,
      message: "Condominium source account registered successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCondoAccount = async (req, res, next) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(req.user.role)) {
      throw new AppError("Only authorized administrators can update condominium source accounts", 403);
    }
    const account = await updateCondoAccountService(req.user, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: "Condominium source account updated successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCondoAccount = async (req, res, next) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(req.user.role)) {
      throw new AppError("Only authorized administrators can deactivate condominium source accounts", 403);
    }
    const result = await deleteCondoAccountService(req.user, req.params.id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultCondoAccount = async (req, res, next) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(req.user.role)) {
      throw new AppError("Only authorized administrators can set default condominium source accounts", 403);
    }
    const account = await setDefaultCondoAccountService(req.user, req.params.id);
    res.status(200).json({
      success: true,
      message: "Default condominium source account updated successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};
