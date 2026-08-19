
import express from "express";
import * as reportController from "../controllers/report.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { optionalUpload } from "../middleware/optionalUpload.middleware.js";
import upload  from "../middleware/upload.middleware.js";
import {validate, validateQuery, validateParams}  from "../middleware/validate.middleware.js";
import {
  createReportValidation,
  updateReportValidation,
  addReportResponseValidation,
  assignReportValidation,
  updateReportStatusValidation,
  getReportsQueryValidation,
  idParamValidation
} from "../inputValidation/report.validation.js";

const router = express.Router();

router.use(authenticate);

// RESIDENT ROUTES (All authenticated users)

router.get(
  "/my",
  validateQuery(getReportsQueryValidation),
  reportController.getMyReports
);

// Get single report (Resident sees only their own, Admin sees all)
router.get(
  "/:id",
  validateParams(idParamValidation),
  reportController.getReportById
);

// Create report
router.post(
  "/",
  upload.single('photo'),
  validate(createReportValidation),
  reportController.createReport
);

// Update report (Reporter can update their own, Admin can update any)
router.put(
  "/:id",
  upload.single('photo'),
  validateParams(idParamValidation),
  validate(updateReportValidation),
  reportController.updateReport
);

// Delete report (Reporter can delete their own, Admin can delete any)
router.delete(
  "/:id",
  validateParams(idParamValidation),
  reportController.deleteReport
);

// Add response to a report (Admin or Reporter)
router.post(
  "/:id/response",
  validateParams(idParamValidation),
  validate(addReportResponseValidation),
  reportController.addReportResponse
);

// Get all reports (Admin sees all in their condo)
router.get(
  "/admin/all",
  authorizeRoles("condo_admin", "super_admin"),
  validateQuery(getReportsQueryValidation),
  reportController.getAllReportsForAdmin
);

// Assign report (Admin only)
router.put(
  "/:id/assign",
  authorizeRoles("condo_admin", "super_admin"),
  validateParams(idParamValidation),
  validate(assignReportValidation),
  reportController.assignReport
);

// Update report status (Admin only)
router.put(
  "/:id/status",
  authorizeRoles("condo_admin", "super_admin"),
  validateParams(idParamValidation),
  validate(updateReportStatusValidation),
  reportController.updateReportStatus
);

export default router;