import express from "express";

import {
  getDashboardStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  restoreUser,
  verifyUser,
  updateUserRole,
  assignUserCondo,
} from "../controllers/admin.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

import {
  authorizeRoles,
} from "../middleware/role.middleware.js";

import {
  Roles,
} from "../config/roles.config.js";


const router =
  express.Router();


// ALL ADMIN ROUTES REQUIRE LOGIN

router.use(authenticate);


// DASHBOARD

router.get(
  "/dashboard",

  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),

  getDashboardStats
);


// USERS

router.get(
  "/users",

  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),

  getUsers
);


router.get(
  "/users/:id",

  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),

  getUserById
);


router.post(
  "/users",

  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),

  createUser
);


router.patch(
  "/users/:id",

  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),

  updateUser
);


router.delete(
  "/users/:id",

  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),

  deleteUser
);


// RESTORE

router.patch(
  "/users/:id/restore",

  authorizeRoles(
    Roles.SUPER_ADMIN
  ),

  restoreUser
);


// VERIFY

router.patch(
  "/users/:id/verify",

  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),

  verifyUser
);


// PROMOTE / DEMOTE

router.patch(
  "/users/:id/role",

  authorizeRoles(
    Roles.SUPER_ADMIN
  ),

  updateUserRole
);


// MOVE USER BETWEEN CONDOS

router.patch(
  "/users/:id/condo",

  authorizeRoles(
    Roles.SUPER_ADMIN
  ),

  assignUserCondo
);


export default router;