import express from "express";

import {
  addIddirMemberController,
  getIddirMembersController,
  getIddirMemberByIdController,
  updateIddirMemberController,
  removeIddirMemberController,
} from "../controllers/iddirMember.controller.js";

import {authenticate} from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";
const router = express.Router();



router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  addIddirMemberController
);



router.get(
  "/iddir/:iddirId",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  getIddirMembersController
);



router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  getIddirMemberByIdController
);



router.patch(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  updateIddirMemberController
);



router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),   
  removeIddirMemberController
);


export default router;