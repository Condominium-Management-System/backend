import express from "express";
import * as promotionController from "../controllers/promotion.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { optionalUpload } from "../middleware/optionalUpload.middleware.js";
import upload  from "../middleware/upload.middleware.js";
import {validate, validateQuery, validateParams}  from "../middleware/validate.middleware.js";
import {
  createPromotionValidation,
  updatePromotionValidation,
  reviewPromotionValidation,
  getPromotionsQueryValidation,
  idParamValidation
} from "../inputValidation/promotion.validation.js";

const router = express.Router();

// Middleware to handle both multipart/form-data and application/json gracefully
const uploadFields = upload.fields([
  { name: 'banner', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]);

const handlePromotionUpload = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }
  uploadFields(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.message?.includes('Unexpected field')) {
        return next();
      }
      return next(err);
    }
    next();
  });
};

router.get(
  "/",
  validateQuery(getPromotionsQueryValidation),
  promotionController.getAllPromotions
);

router.get(
  "/:id",
  validateParams(idParamValidation),
  promotionController.getPromotionById
);

router.post(
  "/:id/click",
  validateParams(idParamValidation),
  promotionController.trackClick
);

// ADMIN ROUTES (Admin/Super Admin only)
router.post(
  "/",
  authenticate,
  authorizeRoles("condo_admin", "super_admin"),
  handlePromotionUpload,
  validate(createPromotionValidation),
  promotionController.createPromotion
);

router.put(
  "/:id/review",
  authenticate,
  authorizeRoles("condo_admin", "super_admin"),
  validateParams(idParamValidation),
  validate(reviewPromotionValidation),
  promotionController.reviewPromotion
);

router.put(
  "/:id",
  authenticate,
  authorizeRoles("condo_admin", "super_admin"),
  handlePromotionUpload,
  validateParams(idParamValidation),
  validate(updatePromotionValidation),
  promotionController.updatePromotion
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles("condo_admin", "super_admin"),
  validateParams(idParamValidation),
  promotionController.deletePromotion
);

export default router;