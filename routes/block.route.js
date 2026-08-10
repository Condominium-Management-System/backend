import express from "express";

import {
  createBlock,
  getAllBlocks,
  getBlockById,
  updateBlock,
  deleteBlock
} from "../controllers/block.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const blockRouter = express.Router();

blockRouter.post("/",authenticate,authorizeRoles(Roles.RESIDENT,Roles.RESIDENT),createBlock);

blockRouter.get("/",getAllBlocks);

blockRouter.get("/:id",getBlockById);

blockRouter.patch("/:id",authenticate,authorizeRoles(Roles.CONDO_ADMIN,Roles.RESIDENT),updateBlock);

blockRouter.delete("/:id",authenticate,authorizeRoles(Roles.CONDO_ADMIN,Roles.RESIDENT),deleteBlock);

export default blockRouter;