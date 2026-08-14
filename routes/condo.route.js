import express from "express";

import {
  createCondo,
  getAllCondos,
  getCondoById,
  getCondoByCode,
  updateCondo,
  deleteCondo,
  toggleCondoStatus
} from "../controllers/condo.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  authorizeRoles
} from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();


// ALL ROUTES REQUIRE AUTHENTICATION

router.use(authenticate);


// CREATE
// SUPER ADMIN ONLY

router.post(
  "/",
  authorizeRoles(Roles.SUPER_ADMIN),
  createCondo
);


// GET ALL
// SUPER ADMIN

router.get(
  "/",
  authorizeRoles(Roles.SUPER_ADMIN),
  getAllCondos
);


// GET BY CODE

router.get(
  "/code/:condoCode",
  getCondoByCode
);


// GET BY ID

router.get(
  "/:id",
  getCondoById
);


// UPDATE
// SUPER ADMIN ONLY

router.patch(
  "/:id",
  authorizeRoles(Roles.SUPER_ADMIN),
  updateCondo
);


// ACTIVATE / DEACTIVATE
// SUPER ADMIN ONLY

router.patch(
  "/:id/status",
  authorizeRoles(Roles.SUPER_ADMIN),
  toggleCondoStatus
);


// DELETE
// SUPER ADMIN ONLY

router.delete(
  "/:id",
  authorizeRoles(Roles.SUPER_ADMIN),
  deleteCondo
);


export default router;