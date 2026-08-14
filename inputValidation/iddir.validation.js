import Joi from "joi";

export const createIddirValidation = Joi.object({
  condoId: Joi.string().uuid().required(),

  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  startedDate: Joi.date()
    .required(),

  contributionAmount: Joi.number()
    .positive()
    .required(),
});


export const updateIddirValidation = Joi.object({
  condoId: Joi.string()
    .uuid()
    .optional(),

  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  startedDate: Joi.date()
    .optional(),

  contributionAmount: Joi.number()
    .positive()
    .optional(),

  status: Joi.string()
    .valid("active", "inactive")
    .optional(),
}).min(1);


export const iddirIdValidation = Joi.object({
  id: Joi.string()
    .uuid()
    .required(),
});