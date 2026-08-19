import Joi from "joi";

// add equb member

export const addEqubMemberValidation = Joi.object({
  userId: Joi.string()
    .uuid()
    .required(),

  equbId: Joi.string()
    .uuid()
    .required(),
});

// update equb member

export const updateEqubMemberValidation = Joi.object({
  status: Joi.string()
    .valid(
      "active",
      "inactive",
      "suspended"
    )
    .required(),
});

// equb member id

export const equbMemberIdValidation = Joi.object({
  id: Joi.string()
    .uuid()
    .required(),
});

// equb id

export const equbIdValidation = Joi.object({
  equbId: Joi.string()
    .uuid()
    .required(),
});

// search equb members

export const searchEqubMemberValidation = Joi.object({
  search: Joi.string()
    .trim()
    .allow("")
    .optional(),

  status: Joi.string()
    .valid(
      "active",
      "inactive",
      "suspended"
    )
    .optional(),

  blockId: Joi.string()
    .uuid()
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