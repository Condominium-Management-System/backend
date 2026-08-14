import express from "express";

import {
  createBlock,
  getAllBlocks,
  getBlockById,
  getBlockStatistics,
  updateBlock,
  deleteBlock
} from "../controllers/block.controller.js";

import { authenticate} from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";
const router = express.Router();


// GET ALL

router.get(
  "/",
  authenticate,
  getAllBlocks
);


// GET STATISTICS

router.get(
  "/:id/statistics",
  authenticate,
  getBlockStatistics
);


// GET ONE

router.get(
  "/:id",
  authenticate,
  getBlockById
);


// CREATE

router.post(
  "/",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  createBlock
);


// UPDATE

router.patch(
  "/:id",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  updateBlock
);


// DELETE

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  deleteBlock
);

export default router;