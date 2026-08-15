// routes/announcement.routes.js
import express from "express";
import * as announcementController from "../controllers/announcement.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { optionalUpload } from "../middleware/optionalUpload.middleware.js";
import upload  from "../middleware/upload.middleware.js";
import {validate, validateQuery, validateParams}  from "../middleware/validate.middleware.js";
import {
  createAnnouncementValidation,
  updateAnnouncementValidation,
  getAnnouncementsQueryValidation,
  idParamValidation
} from "../inputValidation/announcement.validation.js";


const router = express.Router();


router.use(authenticate);

// Public routes (any authenticated user can view)
router.get(
  "/",
  validateQuery(getAnnouncementsQueryValidation),
  announcementController.getAllAnnouncements
);

router.get(
  "/pinned",
  announcementController.getPinnedAnnouncements
);

router.get(
  "/:id",
  validateParams(idParamValidation),
  announcementController.getAnnouncementById
);

// Super admin only - get all condos
router.get(
  "/condos/all",
  authorizeRoles("super_admin"),
  announcementController.getAllCondos
);

// Admin only routes (create, update, delete)
router.post(
  "/",
  authorizeRoles("condo_admin", "super_admin"),
  optionalUpload('image'),
  validate(createAnnouncementValidation),
  announcementController.createAnnouncement
);

router.put(
  "/:id",
  authorizeRoles("condo_admin", "super_admin"),
  optionalUpload('image'),
  validateParams(idParamValidation),
  validate(updateAnnouncementValidation),
  announcementController.updateAnnouncement
);

router.delete(
  "/:id",
  authorizeRoles("condo_admin", "super_admin"),
  validateParams(idParamValidation),
  announcementController.deleteAnnouncement
);

export default router;