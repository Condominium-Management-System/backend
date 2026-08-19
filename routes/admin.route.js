import express from "express";

import {
  getDashboardStats,
  adminAddUserToEqub,
  adminRemoveUserFromEqub,
  adminAddUserToIddir,
  adminRemoveUserFromIddir,
  getAdminEqubs,
  getAdminIddirs,
  getAdminPayments,
  getAdminTransactions,
  getAdminServiceFees,
} from "../controllers/admin.controller.js";

import {
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
  restoreUser,
  verifyUser,
  updateUserRole,
} from "../controllers/user.controller.js";

import {
  createRoom,
  searchRooms,
  getAllRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getAvailableRooms,
  getOccupiedRooms,
  getReservedRooms,
} from "../controllers/room.controller.js";

import { register } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

router.use(authenticate);

// Dashboard

router.get(
  "/dashboard",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getDashboardStats
);

// Users

router.get(
  "/users",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAllUsers
);

router.get(
  "/users/:id",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getUserById
);

router.post(
  "/users",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  register
);

router.patch(
  "/users/:id",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  updateUserByAdmin
);

router.delete(
  "/users/:id",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  deleteUser
);

router.patch(
  "/users/:id/restore",
  authorizeRoles(Roles.SUPER_ADMIN),
  restoreUser
);

router.patch(
  "/users/:id/verify",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  verifyUser
);

router.patch(
  "/users/:id/role",
  authorizeRoles(Roles.SUPER_ADMIN),
  updateUserRole
);

// Rooms

router.get(
  "/rooms",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAllRooms
);

router.get(
  "/rooms/search",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  searchRooms
);

router.get(
  "/rooms/available",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAvailableRooms
);

router.get(
  "/rooms/occupied",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getOccupiedRooms
);

router.get(
  "/rooms/reserved",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getReservedRooms
);

router.post(
  "/rooms",
  authorizeRoles(Roles.SUPER_ADMIN, Roles.CONDO_ADMIN),
  createRoom
);

router.get(
  "/rooms/:id",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getRoomById
);

router.patch(
  "/rooms/:id",
  authorizeRoles(Roles.SUPER_ADMIN, Roles.CONDO_ADMIN),
  updateRoom
);

router.patch(
  "/rooms/:id/status",
  authorizeRoles(Roles.SUPER_ADMIN, Roles.CONDO_ADMIN),
  updateRoomStatus
);

router.delete(
  "/rooms/:id",
  authorizeRoles(Roles.SUPER_ADMIN, Roles.CONDO_ADMIN),
  deleteRoom
);

// Equbs

router.get(
  "/equbs",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAdminEqubs
);

router.post(
  "/equbs/members",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  adminAddUserToEqub
);

router.delete(
  "/equbs/:equbId/members/:userId",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  adminRemoveUserFromEqub
);

// Iddirs

router.get(
  "/iddirs",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAdminIddirs
);

router.post(
  "/iddirs/members",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  adminAddUserToIddir
);

router.delete(
  "/iddirs/:iddirId/members/:userId",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  adminRemoveUserFromIddir
);

// Payments

router.get(
  "/payments",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAdminPayments
);

// Transactions

router.get(
  "/transactions",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAdminTransactions
);

// Service Fees

router.get(
  "/service-fees",
  authorizeRoles(Roles.CONDO_ADMIN, Roles.SUPER_ADMIN),
  getAdminServiceFees
);

export default router;