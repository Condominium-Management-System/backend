import {
  getUserAccountsService,
  getUserAccountByIdService,
  createUserAccountService,
  updateUserAccountService,
  deleteUserAccountService,
  setDefaultUserAccountService,
} from "../services/userAccount.service.js";

export const getMyAccounts = async (req, res, next) => {
  try {
    const accounts = await getUserAccountsService(req.user.id);

    res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAccountById = async (req, res, next) => {
  try {
    const account = await getUserAccountByIdService(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const createMyAccount = async (req, res, next) => {
  try {
    const account = await createUserAccountService(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Account added successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyAccount = async (req, res, next) => {
  try {
    const account = await updateUserAccountService(
      req.user.id,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Account updated successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMyAccount = async (req, res, next) => {
  try {
    const result = await deleteUserAccountService(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultMyAccount = async (req, res, next) => {
  try {
    const account = await setDefaultUserAccountService(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Default account updated successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};
