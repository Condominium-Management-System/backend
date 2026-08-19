import express from "express";

import {
  getMyTransactionsController,
  getAllTransactionsController,
  getTransactionByIdController,
  getTransactionByReferenceController,
  getTransactionStatisticsController,
} from "../controllers/transaction.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/my",
  authenticate,
  getMyTransactionsController
);

router.get(
  "/",
  authenticate,
  getAllTransactionsController
);

router.get(
  "/statistics",
  authenticate,
  authorizeRoles(
    "condo_admin",
    "super_admin"
  ),
  getTransactionStatisticsController
);

router.get(
  "/reference/:referenceNo",
  authenticate,
  getTransactionByReferenceController
);

router.get(
  "/:transactionId",
  authenticate,
  getTransactionByIdController
);

export default router;