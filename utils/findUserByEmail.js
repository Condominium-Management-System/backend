import { prisma } from "../config/prisma.config.js";
export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};
