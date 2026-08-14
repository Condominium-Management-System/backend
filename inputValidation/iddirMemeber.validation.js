import Joi from "joi";


export const addIddirMemberValidation = Joi.object({
  userId: Joi.string()
    .uuid()
    .required(),

  iddirId: Joi.string()
    .uuid()
    .required(),
});


export const updateIddirMemberValidation = Joi.object({
  status: Joi.string()
    .valid(
      "active",
      "inactive",
      "suspended"
    )
    .required(),
});


export const iddirMemberIdValidation = Joi.object({
  id: Joi.string()
    .uuid()
    .required(),
});


export const iddirIdValidation = Joi.object({
  iddirId: Joi.string()
    .uuid()
    .required(),
});