import express from "express"

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";
import authRouter from "./routes/auth.router.js"
import { errorHandler, notFound } from "./middleware/error.middleware.js"
import { appConfig } from "./config/app.config.js"
import condoRoutes from "./routes/condo.route.js";
import blockRouter from "./routes/block.route.js"
import roomRoutes from "./routes/room.route.js"

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);
app.get("/", (_req, res) => {
    res.send("YEKONDOMINIUM API")
})

app.use("/api/auth", authRouter)
app.use("/api/condos", condoRoutes);
app.use("/api/blocks", blockRouter);
app.use("/api/rooms", roomRoutes);
app.use(notFound)
app.use(errorHandler)

export default app