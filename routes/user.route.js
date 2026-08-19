import express from "express";

import {
  getAllUsers,
  searchUsers,
  getUserById,
  getUserProfile,
  verifyUser,
  updateUserRole,
  updateUserByAdmin,
  deleteUser,
  restoreUser
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  authorizeRoles
} from "../middleware/role.middleware.js";

import {
  Roles
} from "../config/roles.config.js";

const router = express.Router();

router.use(authenticate);

// Get user profile
router.get(
  "/:userId/profile",
  getUserProfile
);

// Get all users
router.get(
  "/",
  authorizeRoles(
    Roles.GUARD,
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllUsers
);

router.get(
  "/:condoId",
  authorizeRoles(
    Roles.GUARD,
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllUsers
);

// Search users
router.get(
  "/search",
  authorizeRoles(
    Roles.GUARD,
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchUsers
);

router.get(
  "/:condoId/search",
  authorizeRoles(
    Roles.GUARD,
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchUsers
);

// Get one user
router.get(
  "/user/:userId",
  authorizeRoles(
    Roles.GUARD,
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getUserById
);

router.get(
  "/:condoId/:userId",
  authorizeRoles(
    Roles.GUARD,
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getUserById
);

// Verify user
router.patch(
  "/:condoId/:userId/verify",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  verifyUser
);

// Update role
router.patch(
  "/:condoId/:userId/role",
  authorizeRoles(
    Roles.SUPER_ADMIN
  ),
  updateUserRole
);

// Update user
router.patch(
  "/:condoId/:userId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateUserByAdmin
);

// Delete user
router.delete(
  "/:condoId/:userId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  deleteUser
);

// Restore user
router.patch(
  "/:condoId/:userId/restore",
  authorizeRoles(
    Roles.SUPER_ADMIN
  ),
  restoreUser
);

export default router;