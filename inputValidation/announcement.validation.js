
import Joi from 'joi';

export const createAnnouncementValidation = Joi.object({
  title: Joi.string()
    .trim()
    .required()
    .min(3)
    .max(200)
    .messages({
      'any.required': 'Title is required',
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  body: Joi.string()
    .trim()
    .required()
    .min(10)
    .max(5000)
    .messages({
      'any.required': 'Body is required',
      'string.empty': 'Body cannot be empty',
      'string.min': 'Body must be at least 10 characters',
      'string.max': 'Body cannot exceed 5000 characters'
    }),

  announcementType: Joi.string()
    .trim()
    .required()
    .valid('general', 'shop_alert', 'emergency', 'event', 'mourning', 'celebration')
    .messages({
      'any.required': 'Announcement type is required',
      'string.empty': 'Announcement type cannot be empty',
      'any.only': 'Invalid announcement type'
    }),

  condoId: Joi.string()
    .trim()
    .optional()
    .uuid()
    .messages({
      'string.guid': 'Invalid condo ID format'
    }),

  expiryDate: Joi.date()
    .iso()
    .optional()
    .greater('now')
    .messages({
      'date.base': 'Invalid date format',
      'date.iso': 'Date must be in ISO format',
      'date.greater': 'Expiry date must be in the future'
    }),

  isPinned: Joi.boolean()
    .optional()
    .default(false),

  imageUrl: Joi.string()
    .trim()
    .optional()
    .uri()
    .allow(null, '')
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    }),

  isPublic: Joi.boolean()
    .optional()
    .default(true)
});

// Validation schema for updating an announcement
export const updateAnnouncementValidation = Joi.object({
  title: Joi.string()
    .trim()
    .optional()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  body: Joi.string()
    .trim()
    .optional()
    .min(10)
    .max(5000)
    .messages({
      'string.min': 'Body must be at least 10 characters',
      'string.max': 'Body cannot exceed 5000 characters'
    }),

  announcementType: Joi.string()
    .trim()
    .optional()
    .valid('general', 'shop_alert', 'emergency', 'event', 'mourning', 'celebration')
    .messages({
      'any.only': 'Invalid announcement type'
    }),

  expiryDate: Joi.date()
    .iso()
    .optional()
    .greater('now')
    .allow(null)
    .messages({
      'date.base': 'Invalid date format',
      'date.iso': 'Date must be in ISO format',
      'date.greater': 'Expiry date must be in the future'
    }),

  isPinned: Joi.boolean()
    .optional(),

  imageUrl: Joi.string()
    .trim()
    .optional()
    .uri()
    .allow(null, '')
    .messages({
      'string.uri': 'Image URL must be a valid URL'
    }),

  isPublic: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for query parameters
export const getAnnouncementsQueryValidation = Joi.object({
  announcementType: Joi.string()
    .trim()
    .optional()
    .valid('general', 'shop_alert', 'emergency', 'event', 'mourning', 'celebration')
    .messages({
      'any.only': 'Invalid announcement type'
    }),

  isPinned: Joi.boolean()
    .optional(),

  isPublic: Joi.boolean()
    .optional(),

  search: Joi.string()
    .trim()
    .optional()
    .max(100)
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),

  page: Joi.number()
    .integer()
    .optional()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .optional()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    })
});

//Validation schema for ID parameter
export const idParamValidation = Joi.object({
  id: Joi.string()
    .trim()
    .required()
    .uuid()
    .messages({
      'any.required': 'ID is required',
      'string.empty': 'ID cannot be empty',
      'string.guid': 'Invalid ID format. Must be a valid UUID'
    })
});

export default {
  createAnnouncementValidation,
  updateAnnouncementValidation,
  getAnnouncementsQueryValidation,
  idParamValidation
};