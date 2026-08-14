// validations/lostFound.validation.js
import Joi from "joi";

/**
 * Validation schema for creating a lost/found item
 */
export const createLostFoundValidation = Joi.object({
  type: Joi.string()
    .trim()
    .required()
    .valid('lost', 'found')
    .messages({
      'any.required': 'Type is required',
      'string.empty': 'Type cannot be empty',
      'any.only': 'Type must be either "lost" or "found"'
    }),

  itemName: Joi.string()
    .trim()
    .required()
    .min(2)
    .max(100)
    .messages({
      'any.required': 'Item name is required',
      'string.empty': 'Item name cannot be empty',
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 100 characters'
    }),

  description: Joi.string()
    .trim()
    .required()
    .min(5)
    .max(1000)
    .messages({
      'any.required': 'Description is required',
      'string.empty': 'Description cannot be empty',
      'string.min': 'Description must be at least 5 characters',
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  category: Joi.string()
    .trim()
    .required()
    .valid('electronics', 'documents', 'keys', 'clothing', 'jewelry', 'other')
    .messages({
      'any.required': 'Category is required',
      'string.empty': 'Category cannot be empty',
      'any.only': 'Invalid category'
    }),

  location: Joi.string()
    .trim()
    .optional()
    .allow(null, '')
    .max(200)
    .messages({
      'string.max': 'Location cannot exceed 200 characters'
    }),

  dateLostFound: Joi.alternatives()
    .try(
      Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .custom((value, helpers) => {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return helpers.error('date.invalid');
          }
          return value;
        })
        .messages({
          'string.pattern.base': 'Date must be in format YYYY-MM-DD',
          'date.invalid': 'Invalid date'
        }),
      Joi.date()
        .iso()
        .messages({
          'date.base': 'Invalid date format',
          'date.iso': 'Date must be in ISO format'
        })
    )
    .required()
    .messages({
      'any.required': 'Date is required'
    })
});

/**
 * Validation schema for updating a lost/found item
 */
export const updateLostFoundValidation = Joi.object({
  type: Joi.string()
    .trim()
    .optional()
    .valid('lost', 'found')
    .messages({
      'any.only': 'Type must be either "lost" or "found"'
    }),

  itemName: Joi.string()
    .trim()
    .optional()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Item name must be at least 2 characters',
      'string.max': 'Item name cannot exceed 100 characters'
    }),

  description: Joi.string()
    .trim()
    .optional()
    .min(5)
    .max(1000)
    .messages({
      'string.min': 'Description must be at least 5 characters',
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  category: Joi.string()
    .trim()
    .optional()
    .valid('electronics', 'documents', 'keys', 'clothing', 'jewelry', 'other')
    .messages({
      'any.only': 'Invalid category'
    }),

  location: Joi.string()
    .trim()
    .optional()
    .allow(null, '')
    .max(200)
    .messages({
      'string.max': 'Location cannot exceed 200 characters'
    }),

  dateLostFound: Joi.alternatives()
    .try(
      Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .messages({
          'string.pattern.base': 'Date must be in format YYYY-MM-DD'
        }),
      Joi.date()
        .iso()
        .messages({
          'date.base': 'Invalid date format'
        })
    )
    .optional(),

  status: Joi.string()
    .trim()
    .optional()
    .valid('open', 'matched', 'claimed', 'archived')
    .messages({
      'any.only': 'Invalid status'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

/**
 * Validation schema for claiming an item
 */
export const claimItemValidation = Joi.object({
  proofDescription: Joi.string()
    .trim()
    .optional()
    .allow(null, '')
    .max(500)
    .messages({
      'string.max': 'Proof description cannot exceed 500 characters'
    })
});

/**
 * Validation schema for query parameters
 */
export const getLostFoundQueryValidation = Joi.object({
  type: Joi.string()
    .trim()
    .optional()
    .valid('lost', 'found')
    .messages({
      'any.only': 'Type must be either "lost" or "found"'
    }),

  category: Joi.string()
    .trim()
    .optional()
    .valid('electronics', 'documents', 'keys', 'clothing', 'jewelry', 'other')
    .messages({
      'any.only': 'Invalid category'
    }),

  status: Joi.string()
    .trim()
    .optional()
    .valid('open', 'matched', 'claimed', 'archived')
    .messages({
      'any.only': 'Invalid status'
    }),

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

/**
 * Validation schema for ID parameter
 */
export const idParamValidation = Joi.object({
  id: Joi.string()
    .trim()
    .required()
    .uuid()
    .messages({
      'any.required': 'ID is required',
      'string.empty': 'ID cannot be empty',
      'string.guid': 'Invalid ID format'
    })
});

/**
 * Validation schema for archiving old items
 */
export const archiveOldItemsValidation = Joi.object({
  daysOld: Joi.number()
    .integer()
    .optional()
    .min(1)
    .max(365)
    .default(30)
    .messages({
      'number.base': 'Days must be a number',
      'number.integer': 'Days must be an integer',
      'number.min': 'Days must be at least 1',
      'number.max': 'Days cannot exceed 365'
    })
});

export default {
  createLostFoundValidation,
  updateLostFoundValidation,
  claimItemValidation,
  getLostFoundQueryValidation,
  idParamValidation,
  archiveOldItemsValidation
};