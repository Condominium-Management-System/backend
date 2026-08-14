import express from "express";

import {
  getAllUsers,
  getUserById,
  getUserProfile,
  verifyUser,
  updateUserRole,
  updateUserByAdmin,
  deleteUser
} from "../controllers/user.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

import {
  authorizeRoles
} from "../middleware/role.middleware.js";

import { Roles } from "../config/roles.config.js";


const router = express.Router();




router.use(authenticate);


router.get(
  "/",
  authorizeRoles(
    Roles.GUARD,
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  getAllUsers
);



router.get(
  "/:id",
  getUserProfile
);



router.patch(
  "/:id/verify",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  verifyUser
);




router.patch(
  "/:id/role",
  authorizeRoles(
    Roles.SUPER_ADMIN
  ),
  updateUserRole
);



router.patch(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  updateUserByAdmin
);




router.delete(
  "/:id",
  authorizeRoles(
    Roles.CONDO_ADMIN,
    Roles.SUPER_ADMIN
  ),
  deleteUser
);


export default router;