import express from "express";

import {
  createIddirController,
  getPublicIddirsController,
  getPublicIddirByIdController,
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

export default router;