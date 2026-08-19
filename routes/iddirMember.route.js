import express from "express";

import {
  addIddirMemberController,
  getIddirMembersController,
  searchIddirMembersController,
  getIddirMemberByIdController,
  updateIddirMemberController,
  removeIddirMemberController,
} from "../controllers/iddirMember.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

router.use(authenticate);

// Add Iddir member
router.post(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  addIddirMemberController
);

// Get all members
router.get(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirMembersController
);

// Search all members
router.get(
  "/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchIddirMembersController
);

// Get members by condominium
router.get(
  "/:condoId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirMembersController
);

// Search members inside condominium
router.get(
  "/:condoId/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchIddirMembersController
);

// Get members of Iddir inside condominium
router.get(
  "/:condoId/iddir/:iddirId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirMembersController
);

// Get member by ID
router.get(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirMemberByIdController
);

// Get member by ID inside condominium
router.get(
  "/:condoId/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getIddirMemberByIdController
);

// Update member
router.patch(
  "/:condoId/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateIddirMemberController
);

// Remove member
router.delete(
  "/:condoId/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  removeIddirMemberController
);

export default router;