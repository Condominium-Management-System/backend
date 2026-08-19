import Joi from "joi";

export const paymentReceiptValidation = Joi.object({
  paymentIdOrRef: Joi.string()
    .trim()
    .required()
    .messages({
      "any.required":
        "Payment ID or transaction reference is required",

      "string.empty":
        "Payment ID or transaction reference cannot be empty",
    }),
});