// routes/chat.routes.js
import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Get all active conversations for the authenticated user
router.get("/conversations", chatController.getConversations);

// Item Telegram-style group discussion
router.get("/item/:lostFoundId", chatController.getItemDiscussion);

// Send a message
router.post("/messages", chatController.sendMessage);

// Get messages with a specific partner (optional ?lostFoundId=...)
router.get("/messages/:partnerId", chatController.getMessages);

// Mark a message as read
router.patch("/messages/:messageId/read", chatController.markMessageAsRead);

export default router;
