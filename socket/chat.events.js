// socket/chat.events.js
import { getIO } from "./socket.setup.js";

export const emitNewChatMessage = (message) => {
  try {
    const io = getIO();
    // Emit to recipient's private channel
    io.to(`user_${message.receiverId}`).emit("newChatMessage", message);
    // Also emit to sender's private channel (for multiple tabs/devices)
    io.to(`user_${message.senderId}`).emit("newChatMessage", message);
    // If associated with a Lost & Found item, emit to the item room
    if (message.lostFoundId) {
      io.to(`lostFound_${message.lostFoundId}`).emit("newItemChatMessage", message);
      io.to(`lostFound_${message.lostFoundId}`).emit("itemChatMessage", message);
    }
  } catch (error) {
    console.warn("Could not emit newChatMessage via socket:", error.message);
  }
};

export const emitMessageRead = (messageId, readerId, partnerId, lostFoundId = null) => {
  try {
    const io = getIO();
    const payload = { messageId, readerId, lostFoundId, readAt: new Date().toISOString() };
    io.to(`user_${partnerId}`).emit("chatMessageRead", payload);
  } catch (error) {
    console.warn("Could not emit chatMessageRead via socket:", error.message);
  }
};
