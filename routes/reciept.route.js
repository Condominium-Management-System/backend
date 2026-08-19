import express from "express";

import {
  getPaymentReceiptController,
  downloadPaymentReceiptController,
  viewPaymentReceiptPdfController,
} from "../controllers/reciept.controller.js";

import {authenticate} from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/:paymentIdOrRef",
  authenticate,
  getPaymentReceiptController
);



router.get(
  "/:paymentIdOrRef/download",
  authenticate,
  downloadPaymentReceiptController
);


router.get(
  "/:paymentIdOrRef/pdf",
  authenticate,
  viewPaymentReceiptPdfController
);


export default router;