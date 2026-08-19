import Joi from "joi";

export const transactionQueryValidation = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  status: Joi.string().valid(
    "pending",
    "completed",
    "failed",
    "reversed"
  ),

  paymentType: Joi.string().valid(
    "iddir",
    "equb",
    "guard_fee",
    "service_charge",
    "other"
  ),

  paymentMethod: Joi.string().valid(
    "cbe",
    "telebirr",
    "cash",
    "bank_transfer",
    "others"
  ),

  gateway: Joi.string().valid(
    "hx"
  ),

  condoId: Joi.string().uuid(),

  senderId: Joi.string().uuid(),

  receiverId: Joi.string().uuid(),

  search: Joi.string()
    .trim()
    .max(100),

  startDate: Joi.date(),

  endDate: Joi.date(),

  minAmount: Joi.number()
    .min(0),

  maxAmount: Joi.number()
    .min(0),
});

export const transactionIdValidation = Joi.object({
  transactionId: Joi.string()
    .uuid()
    .required(),
});

export const transactionReferenceValidation = Joi.object({
  referenceNo: Joi.string()
    .trim()
    .required(),
});

export const transactionStatisticsValidation = Joi.object({
  condoId: Joi.string().uuid(),
});