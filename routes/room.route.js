import express from "express";

import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  updateRoomStatus,
  deleteRoom
} from "../controllers/room.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const roomRouter = express.Router();

roomRouter.post("/", authenticate,authorizeRoles(Roles.CONDO_ADMIN,Roles.RESIDENT),createRoom);

roomRouter.get("/",authenticate,getAllRooms);

roomRouter.get("/:id",authenticate,getRoomById);

roomRouter.patch("/:id",authenticate,authorizeRoles(Roles.CONDO_ADMIN,Roles.RESIDENT),updateRoom);

roomRouter.patch("/:id/status",authenticate,authorizeRoles(Roles.CONDO_ADMIN,Roles.RESIDENT),updateRoomStatus);

roomRouter.delete("/:id",authenticate,authorizeRoles(Roles.CONDO_ADMIN,Roles.RESIDENT),deleteRoom);

export default roomRouter;