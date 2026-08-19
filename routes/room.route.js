import express from "express";

import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom,
  getAvailableRooms,
  getOccupiedRooms,
  getReservedRooms,
  searchRooms,
  getPublicRooms,
  searchPublicRooms,
  getPublicRoomById,
  getPublicRoomStatistics
} from "../controllers/room.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();

// PUBLIC ALL ROOMS
router.get(
  "/",
  getPublicRooms
);

// PUBLIC SEARCH
router.get(
  "/search",
  searchPublicRooms
);

// PUBLIC AVAILABLE ROOMS
router.get(
  "/available",
  getAvailableRooms
);

// PUBLIC ROOM BY ID
router.get(
  "/public/:roomId",
  getPublicRoomById
);

// PUBLIC BLOCK STATISTICS
router.get(
  "/block/:blockId/statistics",
  getPublicRoomStatistics
);

router.use(authenticate);

// ADMIN GET ALL ROOMS
router.get(
  "/admin",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllRooms
);

// ADMIN GET ALL ROOMS BY CONDO
router.get(
  "/:condoId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllRooms
);

// ADMIN SEARCH ALL ROOMS
router.get(
  "/admin/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchRooms
);

// ADMIN SEARCH ROOMS BY CONDO
router.get(
  "/:condoId/search",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  searchRooms
);

// ADMIN AVAILABLE ROOMS
router.get(
  "/admin/available",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAvailableRooms
);

// ADMIN AVAILABLE ROOMS BY CONDO
router.get(
  "/:condoId/available",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAvailableRooms
);

// ADMIN OCCUPIED ROOMS
router.get(
  "/admin/occupied",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getOccupiedRooms
);

// ADMIN OCCUPIED ROOMS BY CONDO
router.get(
  "/:condoId/occupied",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getOccupiedRooms
);

// ADMIN RESERVED ROOMS
router.get(
  "/admin/reserved",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getReservedRooms
);

// ADMIN RESERVED ROOMS BY CONDO
router.get(
  "/:condoId/reserved",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getReservedRooms
);

// ADMIN GET ONE ROOM
router.get(
  "/admin/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getRoomById
);

// ADMIN GET ONE ROOM BY CONDO
router.get(
  "/:condoId/:roomId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getRoomById
);

// ADMIN CREATE ROOM
router.post(
  "/:condoId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  createRoom
);

// ADMIN UPDATE ROOM STATUS
router.patch(
  "/:condoId/:roomId/status",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateRoomStatus
);

// ADMIN UPDATE ROOM
router.patch(
  "/:condoId/:roomId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateRoom
);

// ADMIN DELETE ROOM
router.delete(
  "/:condoId/:roomId",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  deleteRoom
);

export default router;