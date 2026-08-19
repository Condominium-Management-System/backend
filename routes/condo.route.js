import express from "express";

import {
  createCondo,
  getAllCondos,
  searchCondos,
  getCondoById,
  getCondoByCode,
  updateCondo,
  deleteCondo,
  toggleCondoStatus
} from "../controllers/condo.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

router.use(authenticate);

// CREATE
router.post(
  "/",
  authorizeRoles(Roles.SUPER_ADMIN),
  createCondo
);

// GET ALL
router.get(
  "/",
    getAllCondos
);

// SEARCH
router.get(
  "/search",
  searchCondos
);

// GET BY CODE
router.get(
  "/code/:condoCode",
  getCondoByCode
);

// GET BY ID
router.get(
  "/:id",
  getCondoById
);

// UPDATE
router.patch(
  "/:id",
  authorizeRoles(Roles.SUPER_ADMIN),
  updateCondo
);

// ACTIVATE / DEACTIVATE
router.patch(
  "/:id/status",
  authorizeRoles(Roles.SUPER_ADMIN),
  toggleCondoStatus
);

// DELETE
router.delete(
  "/:id",
  authorizeRoles(Roles.SUPER_ADMIN),
  deleteCondo
);

export default router;