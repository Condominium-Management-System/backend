import Joi from "joi";


// CREATE EQUb

export const createEqubValidation = Joi.object({

  condoId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.uuid":
        "Condo ID must be a valid UUID",

      "any.required":
        "Condo ID is required",
    }),

  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      "string.empty":
        "Equb name is required",

      "string.min":
        "Equb name must be at least 3 characters",

      "any.required":
        "Equb name is required",
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


// UPDATE EQUb

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


// SEARCH EQUb

export const searchEqubValidation = Joi.object({

  search: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      "string.empty":
        "Search query is required",

      "any.required":
        "Search query is required",
    }),

});