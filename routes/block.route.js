import express from "express";

import {
  createBlock,
  searchBlocks,
  getPublicBlocksByCondo,
  getPublicBlockById,
  getAllBlocks,
  getBlockById,
  getBlockStatistics,
  updateBlock,
  deleteBlock
} from "../controllers/block.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();


// PUBLIC SEARCH

router.get(
  "/search",
  searchBlocks
);


// ADMIN GET ALL BLOCKS INSIDE CONDO

router.get(
  "/:condoId/blocks/admin",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  getAllBlocks
);


// ADMIN GET ONE BLOCK INSIDE CONDO

router.get(
  "/:condoId/blocks/:blockId/admin",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  getBlockById
);


// ADMIN BLOCK STATISTICS

router.get(
  "/:condoId/blocks/:blockId/statistics",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  getBlockStatistics
);


// CREATE BLOCK

router.post(
  "/:condoId/blocks",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  createBlock
);


// UPDATE BLOCK

router.patch(
  "/:condoId/blocks/:blockId",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  updateBlock
);


// DELETE BLOCK

router.delete(
  "/:condoId/blocks/:blockId",
  authenticate,
  authorizeRoles(
    Roles.SUPER_ADMIN,
    Roles.CONDO_ADMIN
  ),
  deleteBlock
);


// PUBLIC BLOCK LIST

router.get(
  "/:condoId/blocks",
  getPublicBlocksByCondo
);


// PUBLIC SINGLE BLOCK

router.get(
  "/:condoId/blocks/:blockId",
  getPublicBlockById
);


export default router;