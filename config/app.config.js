export const appConfig = {
  port:Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  CLOUDINARY_CLOUD_NAME:process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY:process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET:process.env.CLOUDINARY_API_SECRET,
}