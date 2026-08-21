import jwt from "jsonwebtoken"
import { appConfig } from "../config/app.config.js"

export const signAccessToken = (user) => {
  return jwt.sign(
    { role: user.role, email: user.email, condoId: user.condoId || null },
    appConfig.accessTokenSecret,
    { subject: user.id, expiresIn: appConfig.accessTokenExpiresIn }
  )
}

export const signRefreshToken = (user) => {
  return jwt.sign(
    { role: user.role, email: user.email },
    appConfig.refreshTokenSecret,
    { subject: user.id, expiresIn: appConfig.refreshTokenExpiresIn }
  )
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, appConfig.accessTokenSecret)
}

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, appConfig.refreshTokenSecret)
}