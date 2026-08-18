// validations/promotion.validation.js
import Joi from "joi";

// Validation schema for creating a promotion (Admin only)
export const createPromotionValidation = Joi.object({
  title: Joi.string().trim().required().min(3).max(200).messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters'
  }),

  description: Joi.string().trim().required().min(10).max(5000).messages({
    'any.required': 'Description is required',
    'string.empty': 'Description cannot be empty',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 5000 characters'
  }),

  type: Joi.string().trim().required().valid('shop', 'technical', 'service', 'product', 'event', 'other').messages({
    'any.required': 'Type is required',
    'string.empty': 'Type cannot be empty',
    'any.only': 'Invalid promotion type'
  }),

  category: Joi.string().trim().optional().allow(null, '').max(50).messages({
    'string.max': 'Category cannot exceed 50 characters'
  }),

  price: Joi.number().positive().required().messages({
    'any.required': 'Price is required',
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be greater than 0'
  }),

  businessName: Joi.string().trim().required().min(2).max(100).messages({
    'any.required': 'Business name is required',
    'string.empty': 'Business name cannot be empty',
    'string.min': 'Business name must be at least 2 characters',
    'string.max': 'Business name cannot exceed 100 characters'
  }),

  contactPerson: Joi.string().trim().optional().allow(null, '').max(100).messages({
    'string.max': 'Contact person cannot exceed 100 characters'
  }),

  contactNumber: Joi.string().trim().required().pattern(/^(09|07)\d{8}$|^\+251[79]\d{8}$/).messages({
    'any.required': 'Contact number is required',
    'string.empty': 'Contact number cannot be empty',
    'string.pattern.base': 'Invalid phone number format'
  }),

  email: Joi.string().trim().optional().email().allow(null, '').messages({
    'string.email': 'Invalid email address'
  }),

  websiteUrl: Joi.string().trim().optional().uri().allow(null, '').messages({
    'string.uri': 'Invalid website URL'
  }),

  expiresAt: Joi.date().iso().required().greater('now').messages({
    'any.required': 'Expiry date is required',
    'date.base': 'Invalid date format',
    'date.iso': 'Date must be in ISO format',
    'date.greater': 'Expiry date must be in the future'
  }),

  condoId: Joi.string().trim().optional().uuid().allow(null).messages({
    'string.guid': 'Invalid condo ID format'
  })
});

// Validation schema for updating a promotion (Admin only)
export const updatePromotionValidation = Joi.object({
  title: Joi.string().trim().optional().min(3).max(200).messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters'
  }),

  description: Joi.string().trim().optional().min(10).max(5000).messages({
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 5000 characters'
  }),

  type: Joi.string().trim().optional().valid('shop', 'technical', 'service', 'product', 'event', 'other').messages({
    'any.only': 'Invalid promotion type'
  }),

  category: Joi.string().trim().optional().allow(null, '').max(50),

  price: Joi.number().positive().optional().messages({
    'number.base': 'Price must be a number',
    'number.positive': 'Price must be greater than 0'
  }),

  businessName: Joi.string().trim().optional().min(2).max(100),

  contactPerson: Joi.string().trim().optional().allow(null, '').max(100),

  contactNumber: Joi.string().trim().optional().pattern(/^(09|07)\d{8}$|^\+251[79]\d{8}$/).messages({
    'string.pattern.base': 'Invalid phone number format'
  }),

  email: Joi.string().trim().optional().email().allow(null, '').messages({
    'string.email': 'Invalid email address'
  }),

  websiteUrl: Joi.string().trim().optional().uri().allow(null, '').messages({
    'string.uri': 'Invalid website URL'
  }),

  expiresAt: Joi.date().iso().optional().greater('now').messages({
    'date.base': 'Invalid date format',
    'date.iso': 'Date must be in ISO format',
    'date.greater': 'Expiry date must be in the future'
  }),

  status: Joi.string().trim().optional().valid('pending', 'approved', 'active', 'expired', 'rejected', 'cancelled').messages({
    'any.only': 'Invalid status'
  }),

  isActive: Joi.boolean().optional(),

  rejectionReason: Joi.string().trim().optional().max(500).messages({
    'string.max': 'Rejection reason cannot exceed 500 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for approving/rejecting a promotion (Admin only)
export const reviewPromotionValidation = Joi.object({
  status: Joi.string().trim().required().valid('approved', 'rejected').messages({
    'any.required': 'Status is required',
    'any.only': 'Status must be either "approved" or "rejected"'
  }),

  rejectionReason: Joi.string().trim().optional().when('status', {
    is: 'rejected',
    then: Joi.string().required().min(5).max(500),
    otherwise: Joi.string().optional().allow(null, '')
  }).messages({
    'any.required': 'Rejection reason is required when rejecting',
    'string.min': 'Rejection reason must be at least 5 characters',
    'string.max': 'Rejection reason cannot exceed 500 characters'
  })
});

// Validation schema for query parameters (Public)
export const getPromotionsQueryValidation = Joi.object({
  type: Joi.string().trim().optional().valid('shop', 'technical', 'service', 'product', 'event', 'other').messages({
    'any.only': 'Invalid promotion type'
  }),

  category: Joi.string().trim().optional().max(50),

  status: Joi.string().trim().optional().valid('active', 'expired', 'all').default('active'),

  search: Joi.string().trim().optional().max(100).messages({
    'string.max': 'Search term cannot exceed 100 characters'
  }),

  page: Joi.number().integer().optional().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),

  limit: Joi.number().integer().optional().min(1).max(50).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 50'
  })
});

// Validation schema for ID parameter
export const idParamValidation = Joi.object({
  id: Joi.string().trim().required().uuid().messages({
    'any.required': 'ID is required',
    'string.empty': 'ID cannot be empty',
    'string.guid': 'Invalid ID format. Must be a valid UUID'
  })
});

export default {
  createPromotionValidation,
  updatePromotionValidation,
  reviewPromotionValidation,
  getPromotionsQueryValidation,
  idParamValidation
};