import Joi from "joi";

export const roomValidation = Joi.object({
  condoId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.empty": "Condominium ID is required",
      "string.uuid": "Condominium ID must be a valid UUID",
      "any.required": "Condominium ID is required"
    }),

  blockId: Joi.string()
    .uuid()
    .required()
    .messages({
      "string.empty": "Block ID is required",
      "string.uuid": "Block ID must be a valid UUID",
      "any.required": "Block ID is required"
    }),

  roomNo: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Room number is required",
      "any.required": "Room number is required"
    }),

  floorNo: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Floor number must be a number",
      "number.integer": "Floor number must be an integer",
      "number.min": "Floor number must be at least 1",
      "any.required": "Floor number is required"
    }),

  price: Joi.number()
    .min(0)
    .required()
    .messages({
      "number.base": "Room price must be a number",
      "number.min": "Room price cannot be negative",
      "any.required": "Room price is required"
    }),

  model: Joi.string()
    .valid(
      "studio",
      "one_bedroom",
      "two_bedroom",
      "three_bedroom"
    )
    .required()
    .messages({
      "any.only":
        "Room model must be studio, one_bedroom, two_bedroom, or three_bedroom",
      "any.required": "Room model is required"
    })
});

export const updateRoomSchema = Joi.object({
  roomNo: Joi.string()
    .trim(),

  floorNo: Joi.number()
    .integer()
    .min(1),

  price: Joi.number()
    .min(0),

  model: Joi.string()
    .valid(
      "studio",
      "one_bedroom",
      "two_bedroom",
      "three_bedroom"
    )
}).min(1);

export const updateRoomStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "free",
      "occupied",
      "reserved"
    )
    .required()
    .messages({
      "any.only":
        "Room status must be free, occupied, or reserved",
      "any.required":
        "Room status is required"
    }),

  occupiedById: Joi.string()
    .uuid()
    .allow(null)
    .optional()
});