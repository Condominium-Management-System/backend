import { Router } from "express";

import {
  register,
  login,
  logout,
  me,
  refreshToken,
  forgotPassword,
  resetPassword,
  updateMyProfile,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = Router();


// Public
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh-token", refreshToken);


// Authenticated
router.post(
  "/logout",
  authenticate,
  logout
);

router.get(
  "/me",
  authenticate,
  me
);

router.patch(
  "/me",
  authenticate,

  upload.fields([
    {
      name: "profilePhoto",
      maxCount: 1,
    },
    {
      name: "frontId",
      maxCount: 1,
    },
    {
      name: "backId",
      maxCount: 1,
    },
  ]),

  updateMyProfile
);

export default router;