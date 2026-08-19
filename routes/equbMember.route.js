import express from "express";

import {
  addEqubMemberController,
  getEqubMembersController,
  searchEqubMembersController,
  getEqubMemberByIdController,
  updateEqubMemberController,
  removeEqubMemberController,
} from "../controllers/equbMember.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

router.use(authenticate);

// Add Equb member
router.post(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  addEqubMemberController
);

// Get all Equb members
router.get(
  "/",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getEqubMembersController
);

// Search all Equb members
router.get(
  "/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchEqubMembersController
);

// Get Equb members by condominium
router.get(
  "/:condoId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getEqubMembersController
);

// Search Equb members inside condominium
router.get(
  "/:condoId/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchEqubMembersController
);

// Get members of Equb inside condominium
router.get(
  "/:condoId/equb/:equbId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getEqubMembersController
);

// Get Equb member by ID
router.get(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getEqubMemberByIdController
);

// Get Equb member by ID inside condominium
router.get(
  "/:condoId/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getEqubMemberByIdController
);

// Get Equb member by ID inside Equb
router.get(
  "/:condoId/equb/:equbId/users/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getEqubMemberByIdController
);

// Update Equb member
router.patch(
  "/:condoId/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateEqubMemberController
);

// Remove Equb member
router.delete(
  "/:condoId/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  removeEqubMemberController
);

export default router;