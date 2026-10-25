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
import {
  getAdminEqubs,
  createAdminEqub,
  getAdminIddirs,
  createAdminIddir
} from "../controllers/admin.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

// PUBLIC CONDOMINIUM LOOKUP (For Registration and public directory)
router.get("/", getAllCondos);
router.get("/public", getAllCondos);
router.get("/search", searchCondos);

router.use(authenticate);

// CREATE
router.post(
  "/",
  authorizeRoles(Roles.SUPER_ADMIN),
  createCondo
);

// CONDO-SPECIFIC EQUB ROUTES
router.get(
  "/:condoId/equbs",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAdminEqubs
);

router.post(
  "/:condoId/equbs",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  createAdminEqub
);

// CONDO-SPECIFIC IDDIR ROUTES
router.get(
  "/:condoId/iddirs",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAdminIddirs
);

router.post(
  "/:condoId/iddirs",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  createAdminIddir
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
