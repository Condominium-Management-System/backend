// express backend/backend/routes/condoAccount.route.js
import express from "express";
import {
  getCondoAccounts,
  getCondoAccountById,
  createCondoAccount,
  updateCondoAccount,
  deleteCondoAccount,
  setDefaultCondoAccount,
} from "../controllers/condoAccount.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authenticate);

router.get("/", getCondoAccounts);
router.post("/", createCondoAccount);
router.get("/:id", getCondoAccountById);
router.patch("/:id", updateCondoAccount);
router.put("/:id", updateCondoAccount);
router.delete("/:id", deleteCondoAccount);
router.patch("/:id/default", setDefaultCondoAccount);

export default router;
