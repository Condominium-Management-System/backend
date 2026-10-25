import AppError from "../errorhandler/AppError.js";

import {
  getDashboardStatsService,
  adminAddUserToEqubService,
  adminRemoveUserFromEqubService,
  adminAddUserToIddirService,
  adminRemoveUserFromIddirService,
  getAdminEqubsService,
  getAdminIddirsService,
  getAdminPaymentsService,
  getAdminTransactionsService,
  getAdminServiceFeesService,
  getAdminEqubByIdService,
  createAdminEqubService,
  updateAdminEqubService,
  deleteAdminEqubService,
  drawAdminEqubWinnerService,
  adminRecordEqubContributionService,
  getAdminIddirByIdService,
  createAdminIddirService,
  updateAdminIddirService,
  deleteAdminIddirService,
  adminRecordIddirContributionService,
  adminDisburseIddirFundService,
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


// ADD USER TO EQUB

export const adminAddUserToEqub =
  async (req, res, next) => {

    try {

      const result =
        await adminAddUserToEqubService(
          req.user,
          req.body
        );

      res.status(201).json({
        success: true,

        message:
          "User added to Equb successfully",

        data: result,
      });

    } catch (error) {
      next(error);
    }
  };


// REMOVE USER FROM EQUB

export const adminRemoveUserFromEqub =
  async (req, res, next) => {

    try {

      const result =
        await adminRemoveUserFromEqubService(
          req.user,
          req.params.equbId,
          req.params.userId
        );

      res.status(200).json({
        success: true,

        message:
          "User removed from Equb successfully",

        data: result,
      });

    } catch (error) {
      next(error);
    }
  };


// ADD USER TO IDDIR

export const adminAddUserToIddir =
  async (req, res, next) => {

    try {

      const result =
        await adminAddUserToIddirService(
          req.user,
          req.body
        );

      res.status(201).json({
        success: true,

        message:
          "User added to Iddir successfully",

        data: result,
      });

    } catch (error) {
      next(error);
    }
  };


// REMOVE USER FROM IDDIR

export const adminRemoveUserFromIddir =
  async (req, res, next) => {

    try {

      const result =
        await adminRemoveUserFromIddirService(
          req.user,
          req.params.iddirId,
          req.params.userId
        );

      res.status(200).json({
        success: true,

        message:
          "User removed from Iddir successfully",

        data: result,
      });

    } catch (error) {
      next(error);
    }
  };


// ── ADMIN EQUBS ──────────────────────────────────────────────────────────────

export const getAdminEqubs = async (req, res, next) => {
  try {
    const result = await getAdminEqubsService(req.user, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// ── ADMIN IDDIRS ─────────────────────────────────────────────────────────────

export const getAdminIddirs = async (req, res, next) => {
  try {
    const result = await getAdminIddirsService(req.user, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// ── ADMIN PAYMENTS ───────────────────────────────────────────────────────────

export const getAdminPayments = async (req, res, next) => {
  try {
    const result = await getAdminPaymentsService(req.user, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// ── ADMIN TRANSACTIONS ───────────────────────────────────────────────────────

export const getAdminTransactions = async (req, res, next) => {
  try {
    const result = await getAdminTransactionsService(req.user, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// ── ADMIN SERVICE FEES ───────────────────────────────────────────────────────

export const getAdminServiceFees = async (req, res, next) => {
  try {
    const result = await getAdminServiceFeesService(req.user, req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// ── EQUB MANAGEMENT HANDLERS ──────────────────────────────────────────────────

export const getAdminEqubById = async (req, res, next) => {
  try {
    const result = await getAdminEqubByIdService(req.user, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createAdminEqub = async (req, res, next) => {
  try {
    const result = await createAdminEqubService(req.user, req.body);
    res.status(201).json({ success: true, message: "Equb created successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const updateAdminEqub = async (req, res, next) => {
  try {
    const result = await updateAdminEqubService(req.user, req.params.id, req.body);
    res.status(200).json({ success: true, message: "Equb updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminEqub = async (req, res, next) => {
  try {
    const result = await deleteAdminEqubService(req.user, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const drawAdminEqubWinner = async (req, res, next) => {
  try {
    const result = await drawAdminEqubWinnerService(req.user, req.params.equbId, req.body);
    res.status(200).json({ success: true, message: "Equb winner drawn successfully!", data: result });
  } catch (error) {
    next(error);
  }
};

export const adminRecordEqubContribution = async (req, res, next) => {
  try {
    const result = await adminRecordEqubContributionService(req.user, req.params.equbId, req.params.userId, req.body);
    res.status(200).json({ success: true, message: "Contribution recorded successfully", data: result });
  } catch (error) {
    next(error);
  }
};


// ── IDDIR MANAGEMENT HANDLERS ─────────────────────────────────────────────────

export const getAdminIddirById = async (req, res, next) => {
  try {
    const result = await getAdminIddirByIdService(req.user, req.params.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const createAdminIddir = async (req, res, next) => {
  try {
    const result = await createAdminIddirService(req.user, req.body);
    res.status(201).json({ success: true, message: "Iddir created successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const updateAdminIddir = async (req, res, next) => {
  try {
    const result = await updateAdminIddirService(req.user, req.params.id, req.body);
    res.status(200).json({ success: true, message: "Iddir updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminIddir = async (req, res, next) => {
  try {
    const result = await deleteAdminIddirService(req.user, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const adminRecordIddirContribution = async (req, res, next) => {
  try {
    const result = await adminRecordIddirContributionService(req.user, req.params.iddirId, req.params.userId, req.body);
    res.status(200).json({ success: true, message: "Contribution recorded successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const adminDisburseIddirFund = async (req, res, next) => {
  try {
    const result = await adminDisburseIddirFundService(req.user, req.params.iddirId, req.body);
    res.status(200).json({ success: true, message: "Iddir funds disbursed successfully!", data: result });
  } catch (error) {
    next(error);
  }
};
