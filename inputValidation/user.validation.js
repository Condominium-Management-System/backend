import Joi from "joi";

const userValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .required()
    .min(3)
    .messages({
      "string.empty": "Full name is required",
      "string.min": "Full name must be at least 3 characters",
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .required()
    .email()
    .messages({
      "string.empty": "Email is required",
      "string.email": "Please provide a valid email",
    }),

  password: Joi.string()
    .required()
    .min(8)
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters",
    }),

  phoneNumber: Joi.string()
    .trim()
    .required()
    .pattern(/^(09|07)\d{8}$|^\+251[79]\d{8}$/)
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base":
        "Phone number must be 10 digits starting with 09 or 07, or +251 followed by 9 digits",
    }),

  fan: Joi.string()
    .trim()
    .required()
    .pattern(/^\d{16}$/)
    .messages({
      "string.empty": "FAN number is required",
      "string.pattern.base": "FAN number must contain exactly 16 digits",
    }),

  condoCode: Joi.string()
    .trim()
    .required()
    .min(2)
    .max(50)
    .messages({
      "string.empty": "Condo code is required",
    }),

  condoId: Joi.string().uuid().allow("", null).optional(),
  role: Joi.string()
    .valid("resident", "condo_admin", "guard", "super_admin")
    .optional(),
  block: Joi.string().allow("", null).optional(),
  roomNo: Joi.string().allow("", null).optional(),
  isVerified: Joi.boolean().optional(),
}).options({ stripUnknown: true });

export default userValidation;
