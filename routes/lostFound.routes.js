// routes/lostFound.routes.js
import express from "express";
import * as lostFoundController from "../controllers/lostFound.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { optionalUpload } from "../middleware/optionalUpload.middleware.js";
import upload  from "../middleware/upload.middleware.js";
import {validate, validateQuery, validateParams}  from "../middleware/validate.middleware.js";
import {
  createLostFoundValidation,
  updateLostFoundValidation,
  claimItemValidation,
  getLostFoundQueryValidation,
  idParamValidation,
  archiveOldItemsValidation
} from "../inputValidation/lostFound.validation.js";


const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all lost/found items with filters
router.get(
  "/",
  validateQuery(getLostFoundQueryValidation),
  lostFoundController.getAllLostFound
);

// Get single item
router.get(
  "/:id",
  validateParams(idParamValidation),
  lostFoundController.getLostFoundById);

// Create - Photo is optional
router.post(
  "/",
  optionalUpload('photo'),
  validate(createLostFoundValidation),
  lostFoundController.createLostFound
);

// Claim an item
router.post(
  "/:id/claim",
  validateParams(idParamValidation),
  validate(claimItemValidation),
  lostFoundController.claimItem
);

// Admin routes
router.put(
  "/:id/verify-claim",
  authorizeRoles("admin", "super_admin"),
  validateParams(idParamValidation),
  lostFoundController.verifyClaim
);

router.post(
  "/archive",
  authorizeRoles("admin", "super_admin"),
  validate(archiveOldItemsValidation),
  lostFoundController.archiveOldItems
);

// Update - Photo is optional
router.put(
  "/:id",
  optionalUpload('photo'),
  validateParams(idParamValidation),
  validate(updateLostFoundValidation),
  lostFoundController.updateLostFound
);

// Delete
router.delete(
  "/:id",
  validateParams(idParamValidation),
  lostFoundController.deleteLostFound
);

export default router;