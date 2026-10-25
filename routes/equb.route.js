import { createAdminEqub, updateAdminEqub, deleteAdminEqub } from "../controllers/admin.controller.js";
import express from "express";

import {
  createEqubController,
  getAllEqubsController,
  getEqubByIdController,
  getPublicEqubsController,
  getPublicEqubByIdController,
  getMyEqubsController,
  getMyEqubByIdController,
  requestJoinEqubController,
  searchEqubsController,
  updateEqubController,
  deleteEqubController,
} from "../controllers/equb.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

// PUBLIC / USER
router.get(
  "/:condoId/equbs/public",
  getPublicEqubsController
);

// PUBLIC / USER
router.get(
  "/:condoId/equbs/:id/public",
  getPublicEqubByIdController
);

router.use(authenticate);

// Resident Portal Equb Endpoints
router.get("/my", getMyEqubsController);
router.get("/my/:id", getMyEqubByIdController);
router.post("/:id/join", requestJoinEqubController);

// ADMIN GET ALL
router.get(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllEqubsController
);

// ADMIN GET ALL BY CONDO
router.get(
  "/:condoId/equbs",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllEqubsController
);

// ADMIN GET BY CONDO DIRECT
router.get(
  "/:condoId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllEqubsController
);

// ADMIN SEARCH ALL
router.get(
  "/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchEqubsController
);

// ADMIN SEARCH BY CONDO
router.get(
  "/:condoId/equbs/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchEqubsController
);

// ADMIN GET ONE
router.get(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getEqubByIdController
);

// ADMIN CREATE (DIRECT)
router.post(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  createAdminEqub
);

// ADMIN CREATE BY CONDO (DIRECT)
router.post(
  "/:condoId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  createAdminEqub
);

// ADMIN CREATE
router.post(
  "/:condoId/equbs",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  createEqubController
);

// ADMIN UPDATE (DIRECT)
router.patch(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateAdminEqub
);

// ADMIN UPDATE
router.patch(
  "/:condoId/equbs/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateEqubController
);

// ADMIN DELETE (DIRECT)
router.delete(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  deleteAdminEqub
);

// ADMIN DELETE
router.delete(
  "/:condoId/equbs/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  deleteEqubController
);

export default router;
