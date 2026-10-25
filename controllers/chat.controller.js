// controllers/chat.controller.js
import * as chatService from "../services/chat.service.js";

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const message = await chatService.sendMessageService(senderId, req.body);
    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await chatService.getConversationsService(userId);
    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;
    const result = await chatService.getMessagesService(userId, partnerId, req.query);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const markMessageAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;
    const result = await chatService.markMessageAsReadService(userId, messageId);
    res.status(200).json({
      success: true,
      message: "Message marked as read",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get public Telegram-style item discussion messages
export const getItemDiscussion = async (req, res, next) => {
  try {
    const { lostFoundId } = req.params;
    const result = await chatService.getItemDiscussionService(lostFoundId);

    res.status(200).json({
      success: true,
      message: "Item discussion retrieved successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};
