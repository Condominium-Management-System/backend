import {
  getMyTransactions,
  getAllTransactions,
  getTransactionById,
  getTransactionByReference,
  getTransactionStatistics,
} from "../services/transaction.service.js";

export const getMyTransactionsController =
  async (req, res, next) => {
    try {
      const result =
        await getMyTransactions(
          req.user.id,
          req.query
        );

      return res.status(200).json({
        success: true,

        message:
          "Transactions retrieved successfully",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

export const getAllTransactionsController =
  async (req, res, next) => {
    try {
      const result =
        await getAllTransactions(
          req.user,
          req.query
        );

      return res.status(200).json({
        success: true,

        message:
          "Transactions retrieved successfully",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

export const getTransactionByIdController =
  async (req, res, next) => {
    try {
      const result =
        await getTransactionById(
          req.user,
          req.params.transactionId
        );

      return res.status(200).json({
        success: true,

        message:
          "Transaction retrieved successfully",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

export const getTransactionByReferenceController =
  async (req, res, next) => {
    try {
      const result =
        await getTransactionByReference(
          req.user,
          req.params.referenceNo
        );

      return res.status(200).json({
        success: true,

        message:
          "Transaction retrieved successfully",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

export const getTransactionStatisticsController =
  async (req, res, next) => {
    try {
      const result =
        await getTransactionStatistics(
          req.user,
          req.query
        );

      return res.status(200).json({
        success: true,

        message:
          "Transaction statistics retrieved successfully",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };