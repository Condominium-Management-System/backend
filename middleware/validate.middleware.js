// middleware/validate.middleware.js
import AppError from "../errorhandler/AppError.js";

//  Validation middleware using Joi Handles both JSON and form-data
 
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      // Get the data to validate from the request
      let dataToValidate = req[property];
      
      // Handle form-data specially
      if (req.is('multipart/form-data')) {
        dataToValidate = req.body;
      }
      
      // If data doesn't exist, check if there's a file
      if (!dataToValidate || Object.keys(dataToValidate).length === 0) {
        if (req.file || req.files) {
          return next();
        }
        return next(new AppError(`No data found in request ${property}`, 400));
      }

      // Validate the data using Joi
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: true
      });

      // If validation fails, return errors
      if (error) {
        const errors = error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: err.context?.value || null
        }));

        return next(new AppError('Validation failed', 400, errors));
      }

      // Replace request data with validated data
      req[property] = value;
      next();
    } catch (error) {
      console.error('Validation error:', error);
      return next(new AppError('Validation error occurred', 500));
    }
  };
};

export const validateBody = (schema) => validate(schema, 'body');
export const validateQuery = (schema) => validate(schema, 'query');
export const validateParams = (schema) => validate(schema, 'params');

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams
};