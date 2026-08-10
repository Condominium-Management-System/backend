import Joi from "joi";

export const blockValidation = Joi.object({
  condoId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.empty": "Condominium ID is required",
      "string.uuid": "Condominium ID must be a valid UUID",
      "any.required": "Condominium ID is required"
    }),

  blockNo: Joi.string()
    .trim()
    .max(20)
    .required()
    .messages({
      "string.empty": "Block number is required",
      "string.max": "Block number cannot exceed 20 characters",
      "any.required": "Block number is required"
    }),

  noRooms: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Number of rooms must be a number",
      "number.integer": "Number of rooms must be an integer",
      "number.min": "A block must have at least one room",
      "any.required": "Number of rooms is required"
    }),

  noFloors: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Number of floors must be a number",
      "number.integer": "Number of floors must be an integer",
      "number.min": "A block must have at least one floor",
      "any.required": "Number of floors is required"
    })
});