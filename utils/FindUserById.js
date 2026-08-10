export const findUserByIdService = async (id) => {
  return prisma.user.findUnique({
    where: {
      id: String(id),
    },
  });
};