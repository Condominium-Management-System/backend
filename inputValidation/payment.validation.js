import Joi from "joi";

export const initializePaymentValidation = Joi.object({
  paymentType: Joi.string()
    .valid("iddir", "equb", "guard_fee", "service_charge", "other")
    .required()
    .messages({
      "any.required": "Payment type is required",
      "any.only": "Payment type must be iddir, equb, guard_fee, service_charge, or other",
    }),

  amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      "any.required": "Payment amount is required",
      "number.base": "Payment amount must be a number",
      "number.positive": "Payment amount must be greater than zero",
    }),

  paymentMethod: Joi.string()
    .valid("cbe", "telebirr", "cash", "bank_transfer", "others")
    .optional()
    .messages({
      "any.only": "Invalid payment method",
    }),

  accountId: Joi.string()
    .uuid()
    .allow(null, "")
    .optional(),

  useHxAccount: Joi.boolean()
    .optional(),

  equbId: Joi.string()
    .uuid()
    .allow(null, "")
    .optional(),

  iddirId: Joi.string()
    .uuid()
    .allow(null, "")
    .optional(),

  monthYear: Joi.string()
    .max(20)
    .allow("", null)
    .optional(),

  adminNotes: Joi.string()
    .max(500)
    .allow("", null)
    .optional(),
});

export const createPaymentValidation = initializePaymentValidation;

export const paymentQueryValidation = Joi.object({
  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .optional(),

  paymentType: Joi.string()
    .valid("iddir", "equb", "guard_fee", "service_charge", "other")
    .optional(),

  paymentMethod: Joi.string()
    .valid("cbe", "telebirr", "cash", "bank_transfer", "others")
    .optional(),

  condoId: Joi.string().uuid().optional(),
  userId: Joi.string().uuid().optional(),

  search: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .optional(),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),
});

export const rejectPaymentValidation = Joi.object({
  adminNotes: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional(),
});

export const approvePaymentValidation = Joi.object({
  adminNotes: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional(),
});