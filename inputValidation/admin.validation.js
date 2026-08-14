import Joi from "joi";


// ADMIN CREATE USER

export const adminCreateUserValidation = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required(),

  phoneNumber: Joi.string()
    .trim()
    .pattern(
      /^(09|07)\d{8}$|^\+251[79]\d{8}$/
    )
    .required(),

  password: Joi.string()
    .min(8)
    .max(128)
    .required(),

  fan: Joi.string()
    .trim()
    .pattern(/^\d{16}$/)
    .required(),

  condoId: Joi.string()
    .required(),

  block: Joi.string()
    .trim()
    .allow("", null),

  roomNo: Joi.string()
    .trim()
    .allow("", null),

  role: Joi.string()
    .valid(
      "resident",
      "guard",
      "condo_admin"
    )
    .default("resident"),

  isVerified: Joi.boolean()
    .default(false),
});


// ADMIN UPDATE USER

export const adminUpdateUserValidation =
  Joi.object({
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
      .pattern(
        /^(09|07)\d{8}$|^\+251[79]\d{8}$/
      ),

    fan: Joi.string()
      .trim()
      .pattern(/^\d{16}$/),

    password: Joi.string()
      .min(8)
      .max(128),

    condoId: Joi.string(),

    block: Joi.string()
      .trim()
      .allow("", null),

    roomNo: Joi.string()
      .trim()
      .allow("", null),

    role: Joi.string()
      .valid(
        "resident",
        "guard",
        "condo_admin"
      ),

    isVerified: Joi.boolean(),

    dueDate: Joi.date()
      .allow(null),

    privacySettings: Joi.object({
      showPhoneNumber: Joi.boolean(),
      showEmail: Joi.boolean(),
      showProfilePhoto: Joi.boolean(),
      showBlock: Joi.boolean(),
      showRoomNo: Joi.boolean(),
    }),
  })
  .min(1);


// ROLE UPDATE

export const updateRoleValidation =
  Joi.object({
    role: Joi.string()
      .valid(
        "resident",
        "guard",
        "condo_admin"
      )
      .required(),
  });


// VERIFY USER

export const verifyUserValidation =
  Joi.object({
    isVerified: Joi.boolean()
      .required(),
  });


// ASSIGN ROOM

export const assignRoomValidation =
  Joi.object({
    block: Joi.string()
      .trim()
      .required(),

    roomNo: Joi.string()
      .trim()
      .required(),
  });