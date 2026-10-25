// services/chat.service.js
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";
import { emitNewChatMessage, emitMessageRead } from "../socket/chat.events.js";

/**
 * Send a chat message (Optionally tied to a Lost & Found item)
 */
export const sendMessageService = async (senderId, data) => {
  try {
    const { receiverId, content, type = "message", lostFoundId } = data;

    let actualReceiverId = receiverId;

    if (lostFoundId) {
      const itemRecord = await prisma.lostFound.findFirst({
        where: { id: lostFoundId, deletedAt: null }
      });
      if (!itemRecord) {
        throw new AppError("Associated Lost & Found item not found", 404);
      }
      if (!actualReceiverId) {
        actualReceiverId = itemRecord.userId === senderId ? senderId : itemRecord.userId;
      }
    }

    if (!actualReceiverId) {
      throw new AppError("Recipient ID is required", 400);
    }

    if (!content || !content.trim()) {
      throw new AppError("Message content cannot be empty", 400);
    }

    if (senderId === receiverId) {
      throw new AppError("You cannot send a message to yourself", 400);
    }

    // Verify sender
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, condoId: true, fullName: true, role: true }
    });

    if (!sender) {
      throw new AppError("Sender not found", 404);
    }

    // Verify receiver
    const receiver = await prisma.user.findUnique({
      where: { id: actualReceiverId },
      select: { id: true, condoId: true, fullName: true, role: true }
    });

    if (!receiver) {
      throw new AppError("Recipient not found", 404);
    }

    let targetCondoId = sender.condoId || receiver.condoId;
    let item = null;

    if (lostFoundId) {
      item = await prisma.lostFound.findFirst({
        where: { id: lostFoundId, deletedAt: null }
      });

      if (!item) {
        throw new AppError("Associated Lost & Found item not found", 404);
      }
      targetCondoId = item.condoId || targetCondoId;
    }

    if (!targetCondoId) {
      throw new AppError("Condo context is missing for this message", 400);
    }

    // Create the message
    const message = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId: actualReceiverId, content: content.trim(),
        type: type === "photo" ? "photo" : type === "file" ? "file" : "message",
        condoId: targetCondoId,
        lostFoundId: lostFoundId || null
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
            roomNo: true,
            block: true
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true
          }
        },
        lostFound: {
          select: {
            id: true,
            itemName: true,
            type: true,
            category: true,
            status: true,
            photoUrl: true
          }
        }
      }
    });

    // Real-time socket notification
    emitNewChatMessage(message);

    return message;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to send message", 500);
  }
};

/**
 * Get distinct conversations for the current user
 * Grouped by partner AND item (reopening conversation about the same item and participants reuses it)
 */
export const getConversationsService = async (userId) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        deletedAt: null
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
            roomNo: true,
            block: true
          }
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
            roomNo: true,
            block: true
          }
        },
        lostFound: {
          select: {
            id: true,
            itemName: true,
            type: true,
            category: true,
            status: true,
            photoUrl: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const conversationMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId === userId;
      const partner = isSender ? msg.receiver : msg.sender;
      if (!partner) continue;

      const conversationKey = `${partner.id}_${msg.lostFoundId || "general"}`;

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          partnerId: partner.id,
          partner,
          lostFoundId: msg.lostFoundId || null,
          lostFound: msg.lostFound || null,
          lastMessage: {
            id: msg.id,
            content: msg.content,
            type: msg.type,
            senderId: msg.senderId,
            createdAt: msg.createdAt,
            isRead: msg.isRead
          },
          unreadCount: 0
        });
      }

      // If message is unread and addressed to current user
      if (!msg.isRead && msg.receiverId === userId) {
        const conv = conversationMap.get(conversationKey);
        conv.unreadCount += 1;
      }
    }

    return Array.from(conversationMap.values());
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch conversations", 500);
  }
};

/**
 * Get messages between current user and partner, optionally filtered by lostFoundId
 */
export const getMessagesService = async (userId, partnerId, query = {}) => {
  try {
    const { lostFoundId, limit = 100, page = 1 } = query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId }
      ],
      deletedAt: null
    };

    if (lostFoundId && lostFoundId !== "all") {
      if (lostFoundId === "general" || lostFoundId === "null") {
        where.lostFoundId = null;
      } else {
        where.lostFoundId = lostFoundId;
      }
    }

    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true,
              role: true
            }
          },
          lostFound: {
            select: {
              id: true,
              itemName: true,
              type: true,
              category: true,
              status: true,
              photoUrl: true
            }
          }
        },
        orderBy: { createdAt: "asc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.chatMessage.count({ where })
    ]);

    // Mark partner's unread messages as read
    const unreadMessageIds = messages
      .filter((m) => m.receiverId === userId && !m.isRead)
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      await prisma.chatMessage.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true, readAt: new Date() }
      });

      unreadMessageIds.forEach((id) => {
        emitMessageRead(id, userId, partnerId, lostFoundId);
      });
    }

    // Get partner info
    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        profilePhoto: true,
        role: true,
        roomNo: true,
        block: true
      }
    });

    let itemInfo = null;
    if (lostFoundId && lostFoundId !== "general" && lostFoundId !== "all" && lostFoundId !== "null") {
      itemInfo = await prisma.lostFound.findUnique({
        where: { id: lostFoundId },
        select: {
          id: true,
          itemName: true,
          description: true,
          type: true,
          category: true,
          status: true,
          photoUrl: true,
          location: true,
          dateLostFound: true
        }
      });
    }

    return {
      messages,
      partner,
      item: itemInfo,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch messages", 500);
  }
};

/**
 * Mark a single message as read
 */
export const markMessageAsReadService = async (userId, messageId) => {
  try {
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    if (message.receiverId !== userId) {
      throw new AppError("Unauthorized to mark this message as read", 403);
    }

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { isRead: true, readAt: new Date() }
    });

    emitMessageRead(messageId, userId, message.senderId, message.lostFoundId);

    return updated;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to mark message as read", 500);
  }
};

/**
 * Get all public discussion messages for a Lost & Found item (Telegram-style group discussion)
 */
export const getItemDiscussionService = async (lostFoundId) => {
  try {
    const item = await prisma.lostFound.findUnique({
      where: { id: lostFoundId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true
          }
        },
        condo: {
          select: {
            id: true,
            condoName: true,
            condoCode: true
          }
        }
      }
    });

    if (!item) {
      throw new AppError("Lost & Found item not found", 404);
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        lostFoundId,
        deletedAt: null
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true,
            roomNo: true,
            block: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return {
      item,
      messages
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to fetch item discussion", 500);
  }
};
