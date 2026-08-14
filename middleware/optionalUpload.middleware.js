// middleware/optionalUpload.middleware.js
import upload from "./upload.middleware.js";

/**
 * Middleware that handles optional file upload
 * If no file is uploaded, it continues without error
 */
export const optionalUpload = (fieldName = 'photo') => {
  return (req, res, next) => {
    // Check if content-type is multipart/form-data
    if (!req.is('multipart/form-data')) {
      return next();
    }

    // Use multer single upload
    upload.single(fieldName)(req, res, (err) => {
      // If error is about missing field, it's fine (no file uploaded)
      if (err) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || 
            err.message === 'Field name missing' ||
            err.message.includes('Unexpected field')) {
          return next();
        }
        return next(err);
      }
      
      // File uploaded successfully
      if (req.file) {
        console.log('File uploaded:', {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        });
      }
      
      next();
    });
  };
};

// For multiple files
export const optionalMultipleUpload = (fieldName = 'photos', maxCount = 5) => {
  return (req, res, next) => {
    if (!req.is('multipart/form-data')) {
      return next();
    }

    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE' || 
            err.message === 'Field name missing' ||
            err.message.includes('Unexpected field')) {
          return next();
        }
        return next(err);
      }
      
      if (req.files && req.files.length > 0) {
        console.log('Files uploaded:', req.files.map(f => ({
          fieldname: f.fieldname,
          originalname: f.originalname,
          filename: f.filename,
          path: f.path
        })));
      }
      
      next();
    });
  };
};