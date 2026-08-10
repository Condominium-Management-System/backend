import { Router } from "express"
import {
  forgotPassword,
  login,
  logout,
  me,
  refreshToken,
  register,
  resetPassword
} from "../controllers/auth.controller.js"
import { authenticate } from "../middleware/auth.middleware.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword)
router.post("/refresh-token", refreshToken)
router.post("/logout", authenticate, logout)
router.get("/me", authenticate, me)

export default router