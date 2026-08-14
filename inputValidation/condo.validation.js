import Joi from "joi";

const uuid = Joi.string().uuid();

const gpsCoordinatesSchema = Joi.object({
  latitude: Joi.number()
    .min(-90)
    .max(90),

  longitude: Joi.number()
    .min(-180)
    .max(180)
}).unknown(false);

export const createCondoValidation = Joi.object({
  condoName: Joi.string()
    .trim()
    .min(2)
    .max(150)
    .required(),

  address: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required(),

  city: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  gpsCoordinates: gpsCoordinatesSchema
    .optional(),

  maxAdmins: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(1),

  blockNumbers: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(50)
    )
    .unique()
    .default([]),

  customSettings: Joi.object()
    .optional()
}).options({
  abortEarly: false,
  stripUnknown: true
});


export const updateCondoValidation = Joi.object({
  condoName: Joi.string()
    .trim()
    .min(2)
    .max(150),

  address: Joi.string()
    .trim()
    .min(2)
    .max(255),

  city: Joi.string()
    .trim()
    .min(2)
    .max(100),

  gpsCoordinates: gpsCoordinatesSchema,

  maxAdmins: Joi.number()
    .integer()
    .min(1)
    .max(100),

  blockNumbers: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .max(50)
    )
    .unique(),

  activeStatus: Joi.boolean(),

  customSettings: Joi.object()
}).min(1).options({
  abortEarly: false,
  stripUnknown: true
});


export const condoIdValidation = Joi.object({
  id: uuid.required()
}).options({
  abortEarly: false,
  stripUnknown: true
});