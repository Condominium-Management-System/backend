import Joi from "joi";

export const createUserAccountValidation = Joi.object({
  paymentMethod: Joi.string()
    .valid(
      "cbe",
      "telebirr",
      "cash",
      "bank_transfer",
      "card",
      "chapa"
    )
    .required()
    .messages({
      "any.required": "Payment method is required",
      "any.only": "Payment method must be cbe, telebirr, bank_transfer, card, cash, or chapa",
    }),

  accountType: Joi.string()
    .valid("bank", "mobile_money", "wallet")
    .default("bank"),

  accountName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "any.required": "Account holder name is required",
    }),

  accountNumber: Joi.string()
    .trim()
    .min(3)
    .max(50)
    .required()
    .messages({
      "any.required": "Account number / phone number is required",
    }),

  providerName: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  isDefault: Joi.boolean().default(false),
});

export const updateUserAccountValidation = Joi.object({
  accountName: Joi.string()
    .trim()
    .min(2)
    .max(100),

  accountNumber: Joi.string()
    .trim()
    .min(3)
    .max(50),

  paymentMethod: Joi.string()
    .valid(
      "cbe",
      "telebirr",
      "cash",
      "bank_transfer",
      "card",
      "chapa"
    ),

  accountType: Joi.string()
    .valid("bank", "mobile_money", "wallet"),

  providerName: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  status: Joi.string()
    .valid("active", "inactive", "blocked"),

  isDefault: Joi.boolean(),
}).min(1);
