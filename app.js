import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRouter from "./routes/auth.router.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

import authRouter from "./routes/auth.route.js"
import condoRoutes from "./routes/condo.route.js";
import blockRouter from "./routes/block.route.js";
import roomRoutes from "./routes/room.route.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import equbRoutes from "./routes/equb.route.js";
import iddirRoutes from "./routes/iddir.route.js";
import iddirMemberRoutes from "./routes/iddirMember.route.js";
import lostFoundRoutes from "./routes/lostFound.routes.js";
import paymentRoutes from "./routes/payment.route.js";
import transactionRoutes from "./routes/transaction.route.js";
import userAccountRoutes from "./routes/userAccount.route.js";
import recieptRoutes from "./routes/reciept.route.js";
import equbMemberRoutes from "./routes/equbMember.route.js";
import lostFoundRoutes from "./routes/lostFound.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import promotionRoutes from "./routes/promotion.routes.js";
import reportRoutes from "./routes/report.routes.js";

import {
  globalRateLimiter,
  authRateLimiter,
} from "./middleware/security.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: false,
  })
);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(
  express.json({
    limit: "100kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb",
  })
);

app.use("/api", globalRateLimiter);

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "YEKONDOMINIUM API",
  });
});

app.use(
  "/api/auth",
  authRateLimiter,
  authRouter
);
app.use("/api/auth", authRouter)
app.use("/api/condos", condoRoutes);
app.use("/api/blocks", blockRouter);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equbs", equbRoutes);
app.use("/api/iddirs", iddirRoutes);
app.use("/api/iddir-members", iddirMemberRoutes);
app.use("/api/lost-found", lostFoundRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/accounts", userAccountRoutes);
app.use("/api/reciept", recieptRoutes);
app.use("/api/equb-members", equbMemberRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/reports", reportRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
