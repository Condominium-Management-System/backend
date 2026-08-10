import dotenv from "dotenv"
import app from "./app.js"
import { appConfig } from "./config/app.config.js"
import { connectDB, disconnectDB } from "./config/db.config.js"

dotenv.config()

const startServer = async () => {
  try {
    await connectDB()

    const server = app.listen(appConfig.port, () => {
      console.log(`Server is running on port ${appConfig.port}`)
    })

    const shutdown = async () => {
      server.close(async () => {
        await disconnectDB()
        process.exit(0)
      })
    }

    process.once("SIGINT", shutdown)
    process.once("SIGTERM", shutdown)
  } catch (error) {
    console.error("Failed to start server:", error.message)
    process.exit(1)
  }
}

startServer()