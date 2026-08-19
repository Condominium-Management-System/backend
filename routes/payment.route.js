import express from "express";
import {
  initializePayment,
  getPaymentById,
  getPayments,
  getPaymentStatistics,
  getMyPayments,
  approvePayment,
  rejectPayment,
  cancelPayment,
} from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

router.use(authenticate);

// Initialize / Create Payment
router.post("/", authorizeRoles(Roles.RESIDENT, Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), initializePayment);

// My Payments
router.get("/my", authorizeRoles(Roles.RESIDENT, Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), getMyPayments);

// Payment Statistics
router.get("/statistics", authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), getPaymentStatistics);

// All Payments
router.get("/", authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), getPayments);

// Payment Details
router.get("/:id", authorizeRoles(Roles.RESIDENT, Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), getPaymentById);

// Approve Payment
router.patch("/:id/approve", authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), approvePayment);

// Reject Payment
router.patch("/:id/reject", authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), rejectPayment);

// Cancel Payment (Resident)
router.patch("/:id/cancel", authorizeRoles(Roles.RESIDENT, Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), cancelPayment);
router.post("/:id/cancel", authorizeRoles(Roles.RESIDENT, Roles.CONDO_ADMIN, Roles.SUPER_ADMIN), cancelPayment);

export default router;