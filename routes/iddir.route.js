import express from "express";

import {
  createIddirController,
  getIddirsController,
  getIddirByIdController,
  updateIddirController,
  deleteIddirController,
} from "../controllers/iddir.controller.js";

import {authenticate} from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";

const router = express.Router();


router.post(
  "/",
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  createIddirController
);


router.get(
  "/",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  getIddirsController
);


router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  getIddirByIdController
);


router.patch(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  updateIddirController
);


router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  deleteIddirController
);


export default router;