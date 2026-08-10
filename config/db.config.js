import { prisma } from "./prisma.config.js"

export const connectDB = async () => {
  await prisma.$connect()
  console.log("Connected to the database")
  return prisma
}

export const disconnectDB = async () => {
  await prisma.$disconnect()
}