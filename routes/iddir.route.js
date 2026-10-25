import { createAdminIddir, updateAdminIddir, deleteAdminIddir, adminDisburseIddirFund } from "../controllers/admin.controller.js";
import express from "express";

import {
  createIddirController,
  getPublicIddirsController,
  getPublicIddirByIdController,
  getMyIddirsController,
  getMyIddirByIdController,
  getIddirsController,
  getIddirByIdController,
  searchIddirsController,
  updateIddirController,
  deleteIddirController,
} from "../controllers/iddir.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import { authorizeRoles } from "../middleware/role.middleware.js";

import { Roles } from "../config/roles.config.js";

const router = express.Router();

// Public Iddirs

router.use(authenticate);

// Resident Portal Iddir Endpoints
router.get("/my", getMyIddirsController);
router.get("/my/:id", getMyIddirByIdController);

router.get(
  "/users",
  getPublicIddirsController
);

// Public Iddir by id
router.get(
  "/users/:id",
  getPublicIddirByIdController
);


// Admin get all Iddirs
router.get(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirsController
);

// Admin get Iddirs by condominium
router.get(
  "/:condoId/iddirs",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirsController
);

// Admin search all Iddirs
router.get(
  "/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchIddirsController
);

// Admin search Iddirs by condominium
router.get(
  "/:condoId/iddirs/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchIddirsController
);

// Admin get one Iddir
router.get(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirByIdController
);

// Admin create Iddir (DIRECT)
router.post(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  createAdminIddir
);

// Admin create Iddir
router.post(
  "/:condoId/iddirs",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  createIddirController
);

// Admin update Iddir
router.patch(
  "/:condoId/iddirs/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateIddirController
);

// Admin delete Iddir
router.delete(
  "/:condoId/iddirs/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  deleteIddirController
);

// Admin disburse Iddir fund to selected member
router.post(
  "/:iddirId/disburse",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  adminDisburseIddirFund
);

router.post(
  "/:condoId/iddirs/:iddirId/disburse",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  adminDisburseIddirFund
);

export default router;