
import { getIO } from "./socket.setup.js";

export const emitNewAnnouncement = (condoId, announcement) => {
  const io = getIO();
  io.to(`condo_${condoId}`).emit('newAnnouncement', announcement);
};

export const emitAnnouncementUpdated = (condoId, announcement) => {
  const io = getIO();
  io.to(`condo_${condoId}`).emit('announcementUpdated', announcement);
};

export const emitAnnouncementDeleted = (condoId, announcementId) => {
  const io = getIO();
  io.to(`condo_${condoId}`).emit('announcementDeleted', { id: announcementId });
};