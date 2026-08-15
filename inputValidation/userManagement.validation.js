import Joi from "joi";

export const updateUserRoleValidation = Joi.object({
  role: Joi.string()
    .valid(
      "resident",
      "condo_admin",
      "guard",
      "super_admin"
    )
    .required()
});

export const verifyUserValidation = Joi.object({
  isVerified: Joi.boolean().required()
});

export const updateUserByAdminValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100),

  email: Joi.string()
    .trim()
    .lowercase()
    .email(),

  phoneNumber: Joi.string()
    .trim()
    .pattern(/^(09|07)\d{8}$|^\+251[79]\d{8}$/),

  fan: Joi.string()
    .trim()
    .pattern(/^\d{16}$/),

  role: Joi.string().valid(
    "resident",
    "condo_admin",
    "guard",
    "super_admin"
  ),
  dueDate: Joi.date().iso().optional(),
  condoId: Joi.string(),

  block: Joi.string().allow(null, ""),

  roomNo: Joi.string().allow(null, ""),

  isVerified: Joi.boolean()
}).min(1);