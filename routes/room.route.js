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
  getReservedRooms
} from "../controllers/room.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import {authorizeRoles} from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();


// ROOM LIST

router.get(
  "/",
  authenticate,
  getAllRooms
);


// AVAILABLE

router.get(
  "/available",
  authenticate,
  getAvailableRooms
);


// OCCUPIED

router.get(
  "/occupied",
  authenticate,
  getOccupiedRooms
);


// RESERVED

router.get(
  "/reserved",
  authenticate,
  getReservedRooms
);


// CREATE

router.post(
  "/",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  createRoom
);


// GET ONE

router.get(
  "/:id",
  authenticate,
  getRoomById
);


// UPDATE

router.patch(
  "/:id",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  updateRoom
);


// UPDATE STATUS

router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  updateRoomStatus
);


// DELETE

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  deleteRoom
);


export default router;