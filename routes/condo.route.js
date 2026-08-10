import express from "express";

import {
  createCondo,
  getAllCondos,
  getCondoById,
  updateCondo,
  deleteCondo
} from "../controllers/condo.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import { Roles } from "../config/roles.config.js";

const router = express.Router();


router.post("/",authenticate,authorizeRoles(Roles.RESIDENT), createCondo);

router.get("/", getAllCondos);

router.get("/:id", getCondoById);

router.patch("/:id",authenticate, authorizeRoles(Roles.RESIDENT),updateCondo);

router.delete("/:id",authenticate,authorizeRoles(Roles.RESIDENT), deleteCondo);

export default router;
