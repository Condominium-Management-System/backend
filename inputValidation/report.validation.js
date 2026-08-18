// validations/report.validation.js
import Joi from "joi";

// Validation schema for creating a report
export const createReportValidation = Joi.object({
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

  category: Joi.string().trim().required().valid('plumbing', 'electrical', 'structural', 'security', 'noise', 'other').messages({
    'any.required': 'Category is required',
    'string.empty': 'Category cannot be empty',
    'any.only': 'Invalid category'
  }),

  priority: Joi.string().trim().required().valid('low', 'medium', 'high', 'emergency').messages({
    'any.required': 'Priority is required',
    'string.empty': 'Priority cannot be empty',
    'any.only': 'Invalid priority'
  }),

  photoUrl: Joi.string().trim().optional().uri().allow(null, '').messages({
    'string.uri': 'Invalid photo URL'
  })
});

// Validation schema for updating a report (Reporter or Admin)
export const updateReportValidation = Joi.object({
  title: Joi.string().trim().optional().min(3).max(200).messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title cannot exceed 200 characters'
  }),

  description: Joi.string().trim().optional().min(10).max(5000).messages({
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 5000 characters'
  }),

  category: Joi.string().trim().optional().valid('plumbing', 'electrical', 'structural', 'security', 'noise', 'other').messages({
    'any.only': 'Invalid category'
  }),

  priority: Joi.string().trim().optional().valid('low', 'medium', 'high', 'emergency').messages({
    'any.only': 'Invalid priority'
  }),

  status: Joi.string().trim().optional().valid('reported', 'assigned', 'in_progress', 'resolved', 'closed').messages({
    'any.only': 'Invalid status'
  }),

  photoUrl: Joi.string().trim().optional().uri().allow(null, ''),

  resolutionNotes: Joi.string().trim().optional().allow(null, '').max(1000).messages({
    'string.max': 'Resolution notes cannot exceed 1000 characters'
  })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for adding a response (Admin or Reporter)
export const addReportResponseValidation = Joi.object({
  message: Joi.string().trim().required().min(2).max(1000).messages({
    'any.required': 'Message is required',
    'string.empty': 'Message cannot be empty',
    'string.min': 'Message must be at least 2 characters',
    'string.max': 'Message cannot exceed 1000 characters'
  }),

  isAdminResponse: Joi.boolean().optional().default(false)
});
export const assignReportValidation = Joi.object({
  assignedToId: Joi.string().trim().required().uuid().messages({
    'any.required': 'Assigned to user ID is required',
    'string.empty': 'Assigned to user ID cannot be empty',
    'string.guid': 'Invalid user ID format. Must be a valid UUID'
  })
});
// Validation schema for updating status (Admin only)
export const updateReportStatusValidation = Joi.object({
  status: Joi.string().trim().required().valid('reported', 'assigned', 'in_progress', 'resolved', 'closed').messages({
    'any.required': 'Status is required',
    'string.empty': 'Status cannot be empty',
    'any.only': 'Invalid status'
  }),

  resolutionNotes: Joi.string().trim().optional().allow(null, '').max(1000).messages({
    'string.max': 'Resolution notes cannot exceed 1000 characters'
  })
});

// Validation schema for query parameters
export const getReportsQueryValidation = Joi.object({
  status: Joi.string().trim().optional().valid('reported', 'assigned', 'in_progress', 'resolved', 'closed').messages({
    'any.only': 'Invalid status'
  }),

  category: Joi.string().trim().optional().valid('plumbing', 'electrical', 'structural', 'security', 'noise', 'other').messages({
    'any.only': 'Invalid category'
  }),

  priority: Joi.string().trim().optional().valid('low', 'medium', 'high', 'emergency').messages({
    'any.only': 'Invalid priority'
  }),

  search: Joi.string().trim().optional().max(100).messages({
    'string.max': 'Search term cannot exceed 100 characters'
  }),

  page: Joi.number().integer().optional().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),

  limit: Joi.number().integer().optional().min(1).max(100).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
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
  createReportValidation,
  updateReportValidation,
  addReportResponseValidation,
  assignReportValidation,
  updateReportStatusValidation,
  getReportsQueryValidation,
  idParamValidation
};