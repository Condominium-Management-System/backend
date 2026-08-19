import {
  createPaymentService,
  getMyPaymentsService,
  getAllPaymentsService,
  getPaymentByIdService,
  approvePaymentService,
  rejectPaymentService,
  cancelPendingPaymentService,
  getPaymentStatisticsService,
} from "../services/payment.service.js";

// INITIALIZE / CREATE PAYMENT
export const initializePayment = async (req, res, next) => {
  try {
    const result = await createPaymentService(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Payment initialized successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayment = initializePayment;

// GET MY PAYMENTS (Resident)
export const getMyPayments = async (req, res, next) => {
  try {
    const result = await getMyPaymentsService(req.user.id, req.query);

    res.status(200).json({
      success: true,
      message: "My payments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL PAYMENTS (Admin)
export const getPayments = async (req, res, next) => {
  try {
    const result = await getAllPaymentsService(req.user, req.query);

    res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayments = getPayments;

// GET PAYMENT BY ID
export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await getPaymentByIdService(req.user, req.params.id);

    res.status(200).json({
      success: true,
      message: "Payment retrieved successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPaymentById = getPaymentById;

// APPROVE PAYMENT (Admin)
export const approvePayment = async (req, res, next) => {
  try {
    const result = await approvePaymentService(
      req.user,
      req.params.id,
      req.body?.adminNotes
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.payment,
    });
  } catch (error) {
    next(error);
  }
};

// REJECT PAYMENT (Admin)
export const rejectPayment = async (req, res, next) => {
  try {
    const result = await rejectPaymentService(
      req.user,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.payment,
    });
  } catch (error) {
    next(error);
  }
};

// CANCEL PAYMENT (Resident)
export const cancelPayment = async (req, res, next) => {
  try {
    const result = await cancelPendingPaymentService(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

// GET PAYMENT STATISTICS (Admin)
export const getPaymentStatistics = async (req, res, next) => {
  try {
    const result = await getPaymentStatisticsService(req.user, req.query);

    res.status(200).json({
      success: true,
      message: "Payment statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};