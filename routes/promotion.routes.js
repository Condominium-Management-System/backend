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
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
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
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
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