import express from "express";

import {
  createEqubController,
  getAllEqubsController,
  getEqubByIdController,
  updateEqubController,
  deleteEqubController,
  addEqubMemberController,
  removeEqubMemberController,
  updateEqubMemberController,
  getEqubMembersController,
  selectEqubWinnerController,
} from "../controllers/equb.controller.js";

import {authenticate} from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../config/roles.config.js";
const router = express.Router();


// EQUB CRUD

router.post(
  "/",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  createEqubController
);

router.get(
  "/",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  getAllEqubsController
);

router.get(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  getEqubByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  updateEqubController
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  deleteEqubController
);


// MEMBERS

router.post(
  "/:id/members",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  addEqubMemberController
);

router.get(
  "/:id/members",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  getEqubMembersController
);

router.patch(
  "/:id/members/:userId",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  updateEqubMemberController
);

router.delete(
  "/:id/members/:userId",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  removeEqubMemberController
);


// WINNER

router.post(
  "/:id/select-winner",
  authenticate,
  authorizeRoles(Roles.ADMIN, Roles.SUPER_ADMIN),
  selectEqubWinnerController
);


export default router;