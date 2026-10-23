import AppError from "../errorhandler/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.config.js";

export const authenticate = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new AppError("Access token is required", 401));
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return next(new AppError("Invalid authorization header", 401));
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      condoId: payload.condoId || null,
      condoCode: payload.condoCode || null,
    };

    // If condoId was not in JWT payload, resolve from DB
    if (!req.user.condoId && req.user.role === "condo_admin") {
      const dbUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { condoId: true, condoCode: true },
      });
      if (dbUser) {
        req.user.condoId = dbUser.condoId;
        req.user.condoCode = dbUser.condoCode;
      }
    }

    next();
  } catch {
    return next(new AppError("Invalid or expired access token", 401));
  }
};
