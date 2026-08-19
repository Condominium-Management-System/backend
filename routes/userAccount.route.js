import express, { Router } from "express"
import {  

  getMyAccountById,
  createMyAccount,
  updateMyAccount,
  deleteMyAccount,
  setDefaultMyAccount,
  getMyAccounts,
} from "../controllers/userAccount.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
const router = express.Router()
router.use(authenticate);

// ── USER  (CBE, Telebirr, etc.) ───────────────────────────────────────
router.get("/", getMyAccounts);
router.post("/", createMyAccount);
router.get("/:id", getMyAccountById);
router.patch("/:id", updateMyAccount);
router.delete("/:id", deleteMyAccount);
router.patch("/:id/default", setDefaultMyAccount);

export default router;