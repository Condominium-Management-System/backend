// socket/socket.setup.js
import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  // Authentication middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.sub;
      socket.userRole = decoded.role;
      socket.condoId = decoded.condoId;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Join condo room if user has a condo
    if (socket.condoId) {
      socket.join(`condo_${socket.condoId}`);
    }

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });

    // Custom event handlers
    socket.on("joinCondo", (condoId) => {
      if (condoId === socket.condoId) {
        socket.join(`condo_${condoId}`);
      }
    });

    socket.on("leaveCondo", (condoId) => {
      socket.leave(`condo_${condoId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};