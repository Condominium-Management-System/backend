import { prisma } from "../config/prisma.config.js"

export const saveRefreshToken = async (userId, token) => {
  await prisma.refreshToken.create({
    data: { userId: String(userId), token }
  })
}

export const revokeRefreshToken = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId: String(userId) } })
}

export const createPasswordResetToken = async (userId, token, expiresAt) => {
  await prisma.passwordResetToken.create({
    data: {
      userId: String(userId),
      token,
      expiresAt
    }
  })
}

export const findPasswordResetTokenByToken = async (token) => {
  return prisma.passwordResetToken.findUnique({ where: { token } })
}

export const deletePasswordResetTokenByToken = async (token) => {
  await prisma.passwordResetToken.delete({ where: { token } })
}