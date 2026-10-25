// validations/promotion.validation.js
import Joi from "joi";

// Validation schema for creating a promotion (Admin only)
export const createPromotionValidation = Joi.object({
  title: Joi.string().trim().required().min(1).max(255).messages({
    'any.required': 'Title is required',
    'string.empty': 'Title cannot be empty',
  }),

  description: Joi.string().trim().required().min(1).max(10000).messages({
    'any.required': 'Description is required',
    'string.empty': 'Description cannot be empty',
  }),

  type: Joi.string().trim().optional().valid('shop', 'technical', 'service', 'product', 'event', 'other').default('shop'),

  category: Joi.string().trim().optional().allow(null, '').max(100),

  price: Joi.number().min(0).required().messages({
    'any.required': 'Price is required',
    'number.base': 'Price must be a number',
  }),

  businessName: Joi.string().trim().required().min(1).max(150).messages({
    'any.required': 'Business name is required',
    'string.empty': 'Business name cannot be empty',
  }),

  contactPerson: Joi.string().trim().optional().allow(null, '').max(150),

  contactNumber: Joi.string().trim().required().min(3).max(50).messages({
    'any.required': 'Contact number is required',
    'string.empty': 'Contact number cannot be empty',
  }),

  email: Joi.string().trim().optional().allow(null, '').email().allow(''),

  websiteUrl: Joi.string().trim().optional().allow(null, ''),

  expiresAt: Joi.alternatives().try(
    Joi.date(),
    Joi.string()
  ).required().messages({
    'any.required': 'Expiry date is required'
  }),

  condoId: Joi.string().trim().optional().allow(null, '', 'ALL', 'GLOBAL'),
  condoIds: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ).optional().allow(null)
}).unknown(true);

// Validation schema for updating a promotion (Admin only)
export const updatePromotionValidation = Joi.object({
  title: Joi.string().trim().optional().min(1).max(255),
  description: Joi.string().trim().optional().min(1).max(10000),
  type: Joi.string().trim().optional().valid('shop', 'technical', 'service', 'product', 'event', 'other'),
  category: Joi.string().trim().optional().allow(null, '').max(100),
  price: Joi.number().min(0).optional(),
  businessName: Joi.string().trim().optional().min(1).max(150),
  contactPerson: Joi.string().trim().optional().allow(null, '').max(150),
  contactNumber: Joi.string().trim().optional().min(3).max(50),
  email: Joi.string().trim().optional().allow(null, '').email().allow(''),
  websiteUrl: Joi.string().trim().optional().allow(null, ''),
  expiresAt: Joi.alternatives().try(Joi.date(), Joi.string()).optional(),
  status: Joi.string().trim().optional().valid('pending', 'approved', 'active', 'expired', 'rejected', 'cancelled'),
  isActive: Joi.boolean().optional(),
  condoId: Joi.string().trim().optional().allow(null, '', 'ALL', 'GLOBAL'),
  rejectionReason: Joi.string().trim().optional().max(500)
}).unknown(true);

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
  condoId: Joi.string().trim().optional().allow('ALL', ''),
  type: Joi.string().trim().optional().valid('shop', 'technical', 'service', 'product', 'event', 'other').messages({
    'any.only': 'Invalid promotion type'
  }),

  category: Joi.string().trim().optional().max(50),

  status: Joi.string().trim().optional().valid('active', 'expired', 'all', 'pending', 'approved', 'rejected', 'cancelled').default('active'),

  search: Joi.string().trim().optional().max(100).messages({
    'string.max': 'Search term cannot exceed 100 characters'
  }),

  page: Joi.number().integer().optional().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),

  limit: Joi.number().integer().optional().min(1).max(500).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 500'
  })
}).unknown(true);

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