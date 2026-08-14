
// server.js
import dotenv from "dotenv";
import app from "./app.js";
import { appConfig } from "./config/app.config.js";
import { connectDB, disconnectDB } from "./config/db.config.js";
import { initializeSocket } from "./socket/socket.setup.js";
import http from "http";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.io with the server
    const io = initializeSocket(server);
    app.set("io", io); // Make io available in routes/controllers

    // Start server
    server.listen(appConfig.port, () => {
      console.log(`Server is running on port ${appConfig.port}`);
      console.log(`🔌 Socket.IO initialized`);
    });

    const shutdown = async () => {
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();