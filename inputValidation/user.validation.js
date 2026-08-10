import Joi from "joi";

const userValidation = Joi.object({
  fullName: Joi.string().required().min(3),

  email: Joi.string().required().email(),

  password: Joi.string().required().min(8),

  phoneNumber: Joi.string()
    .required()
    .pattern(/^(09|07)\d{8}$|^\+251[79]\d{8}$/)
    .messages({
      "string.pattern.base":
        "Phone number must be 10 digits starting with 09 or 07, or +251 followed by 9 digits",
    }),

    fan:Joi.string().required().length(16),
    condoId:Joi.string().required().min(4).max(6)
});

export default userValidation;