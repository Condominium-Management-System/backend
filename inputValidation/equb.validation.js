import Joi from "joi";

export const createEqubValidation = Joi.object({
  condoId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.uuid": "Condo ID must be a valid UUID",
      "any.required": "Condo ID is required",
    }),

  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.min": "Equb name must be at least 3 characters",
      "any.required": "Equb name is required",
    }),

  contributionAmount: Joi.number()
    .positive()
    .required()
    .messages({
      "number.positive":
        "Contribution amount must be greater than zero",
      "any.required":
        "Contribution amount is required",
    }),

  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format":
        "Start date must be a valid ISO date",
      "any.required":
        "Start date is required",
    }),

  dueDate: Joi.date()
    .iso()
    .required()
    .messages({
      "date.format":
        "Due date must be a valid ISO date",
      "any.required":
        "Due date is required",
    }),
});

export const updateEqubValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100),

  contributionAmount: Joi.number()
    .positive(),

  startDate: Joi.date()
    .iso(),

  dueDate: Joi.date()
    .iso(),

  status: Joi.string()
    .valid(
      "pending",
      "active",
      "completed",
      "cancelled"
    ),
}).min(1);

export const addEqubMemberValidation = Joi.object({
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.uuid":
        "User ID must be a valid UUID",
      "any.required":
        "User ID is required",
    }),
});

export const updateEqubMemberValidation = Joi.object({
  status: Joi.string()
    .valid(
      "active",
      "inactive",
      "removed"
    )
    .required(),
});