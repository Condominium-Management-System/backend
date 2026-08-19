import { getPaymentMethodsService } from "../services/paymentMethod.service.js";

export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await getPaymentMethodsService();
    return res.status(200).json({
      success: true,
      data: methods,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
};
