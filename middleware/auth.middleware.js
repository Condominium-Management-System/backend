import AppError from "../errorhandler/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(
      new AppError("Access token is required", 401)
    );
  }

  const [type, token] = authorization.split(" ");

  if (type !== "Bearer" || !token) {
    return next(
      new AppError("Invalid authorization header", 401)
    );
  }

  try {
    const payload = verifyAccessToken(token);

    
    console.log('🔐 Decoded token payload:', payload);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      condoId: payload.condoId,       
      fullName: payload.fullName,     
    };

    
    console.log('👤 req.user set to:', req.user);

    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    return next(
      new AppError("Invalid or expired access token", 401)
    );
  }
};
