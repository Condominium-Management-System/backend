import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  addEqubMemberValidation,
  updateEqubMemberValidation,
  equbMemberIdValidation,
  equbIdValidation,
  searchEqubMemberValidation,
} from "../inputValidation/equbMembervalidation.js"
const checkAdmin = (requester) => {
  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to manage Equb members",
      403
    );
  }
};

const checkCondoAccess = (
  requester,
  condoId
) => {
  if (requester.role === "super_admin") {
    return;
  }

  if (!requester.condoId) {
    throw new AppError(
      "Your account is not assigned to a condominium",
      403
    );
  }

  if (
    condoId &&
    String(requester.condoId) !== String(condoId)
  ) {
    throw new AppError(
      "You can only manage members from your own condominium",
      403
    );
  }
};

const validateCondo = async (condoId) => {
  const condo = await prisma.condo.findFirst({
    where: {
      id: String(condoId),
      deletedAt: null,
    },
  });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }

  return condo;
};

const validateEqub = async (
  equbId,
  condoId = null
) => {
  const equb = await prisma.equb.findFirst({
    where: {
      id: String(equbId),
      deletedAt: null,
      ...(condoId
        ? {
            condoId: String(condoId),
          }
        : {}),
    },
  });

  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }

  return equb;
};

// add equb member
export const addEqubMemberService = async (
  payload,
  requester
) => {
  const {
    error,
    value,
  } = addEqubMemberValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  checkAdmin(requester);

  const equb = await validateEqub(
    value.equbId
  );

  // condo admin can only manage own condo
  checkCondoAccess(
    requester,
    equb.condoId
  );

  // find user
  const user = await prisma.user.findFirst({
    where: {
      id: value.userId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  // user must belong to the Equb condominium
  if (
    String(user.condoId) !==
    String(equb.condoId)
  ) {
    throw new AppError(
      "User does not belong to this condominium",
      400
    );
  }

  // only residents can become Equb members
  if (user.role !== "resident") {
    throw new AppError(
      "Only residents can become Equb members",
      400
    );
  }

  // equb must be active
  if (equb.status !== "active") {
    throw new AppError(
      "Cannot add a member to an inactive Equb",
      400
    );
  }

  // check existing membership
  const existingMember =
    await prisma.equbMember.findUnique({
      where: {
        equbId_userId: {
          equbId: value.equbId,
          userId: value.userId,
        },
      },
    });

  if (existingMember) {
    if (
      existingMember.status === "active"
    ) {
      throw new AppError(
        "User is already an active member of this Equb",
        409
      );
    }

    // reactivate existing member
    const member =
      await prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.equbMember.update({
              where: {
                id: existingMember.id,
              },
              data: {
                status: "active",
                joinedAt: new Date(),
                leftAt: null,
              },
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    condoId: true,
                    condoCode: true,
                    block: true,
                    roomNo: true,
                    profilePhoto: true,
                  },
                },
                equb: {
                  select: {
                    id: true,
                    name: true,
                    condoId: true,
                    status: true,
                  },
                },
              },
            });

          await tx.equb.update({
            where: {
              id: value.equbId,
            },
            data: {
              noMembers: {
                increment: 1,
              },
            },
          });

          return updated;
        }
      );

    return member;
  }

  // check another active Equb membership
  const activeMembership =
    await prisma.equbMember.findFirst({
      where: {
        userId: value.userId,
        status: "active",
        equbId: {
          not: value.equbId,
        },
      },
    });

  if (activeMembership) {
    throw new AppError(
      "User is already an active member of another Equb",
      409
    );
  }

  // create equb member
  const member =
    await prisma.$transaction(
      async (tx) => {
        const newMember =
          await tx.equbMember.create({
            data: {
              equbId: value.equbId,
              userId: value.userId,
              status: "active",
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                  role: true,
                  condoId: true,
                  condoCode: true,
                  block: true,
                  roomNo: true,
                  profilePhoto: true,
                },
              },
              equb: {
                select: {
                  id: true,
                  name: true,
                  condoId: true,
                  status: true,
                },
              },
            },
          });

        await tx.equb.update({
          where: {
            id: value.equbId,
          },
          data: {
            noMembers: {
              increment: 1,
            },
          },
        });

        return newMember;
      }
    );

  return member;
};

// get equb members
export const getEqubMembersService = async ({
  condoId = null,
  equbId = null,
  requester,
}) => {
  checkAdmin(requester);

  if (condoId) {
    await validateCondo(condoId);
    checkCondoAccess(
      requester,
      condoId
    );
  }

  if (equbId) {
    const equb = await validateEqub(
      equbId,
      condoId
    );

    checkCondoAccess(
      requester,
      equb.condoId
    );

    condoId = equb.condoId;
  }

  const where = {};

  if (condoId) {
    where.equb = {
      condoId: String(condoId),
    };
  } else if (
    requester.role === "condo_admin"
  ) {
    where.equb = {
      condoId: String(
        requester.condoId
      ),
    };
  }

  if (equbId) {
    where.equbId = String(equbId);
  }

  return prisma.equbMember.findMany({
    where,

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          condoId: true,
          condoCode: true,
          block: true,
          roomNo: true,
          profilePhoto: true,
        },
      },

      equb: {
        select: {
          id: true,
          name: true,
          condoId: true,
          status: true,
          noMembers: true,
        },
      },
    },

    orderBy: {
      joinedAt: "desc",
    },
  });
};

// search equb members
export const searchEqubMembersService = async ({
  condoId = null,
  equbId = null,
  requester,
  query,
}) => {
  checkAdmin(requester);

  if (condoId) {
    await validateCondo(condoId);
    checkCondoAccess(
      requester,
      condoId
    );
  }

  if (equbId) {
    const equb = await validateEqub(
      equbId,
      condoId
    );

    checkCondoAccess(
      requester,
      equb.condoId
    );

    condoId = equb.condoId;
  }

  const {
    error,
    value,
  } = searchEqubMemberValidation.validate(
    query
  );

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  const page = value.page;
  const limit = value.limit;
  const skip = (page - 1) * limit;

  const where = {};

  // condo restriction
  if (condoId) {
    where.equb = {
      condoId: String(condoId),
    };
  } else if (
    requester.role === "condo_admin"
  ) {
    where.equb = {
      condoId: String(
        requester.condoId
      ),
    };
  }

  // Equb restriction
  if (equbId) {
    where.equbId = String(equbId);
  }

  // status filter
  if (value.status) {
    where.status = value.status;
  }

  // block filter
  if (value.blockId) {
    where.user = {
      blockId: String(value.blockId),
    };
  }

  // search by any means
  if (
    value.search &&
    value.search.trim()
  ) {
    const keyword =
      value.search.trim();

    where.OR = [
      {
        user: {
          fullName: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      {
        user: {
          email: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      {
        user: {
          phoneNumber: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      {
        user: {
          roomNo: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      {
        user: {
          block: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      {
        equb: {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      {
        equb: {
          condo: {
            condoCode: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
      },

      {
        equb: {
          condo: {
            condoName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
      },
    ];
  }

  const [
    members,
    total,
  ] = await Promise.all([
    prisma.equbMember.findMany({
      where,

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            condoId: true,
            condoCode: true,
            block: true,
            roomNo: true,
            profilePhoto: true,
          },
        },

        equb: {
          select: {
            id: true,
            name: true,
            condoId: true,
            status: true,
            noMembers: true,

            condo: {
              select: {
                id: true,
                condoCode: true,
                condoName: true,
              },
            },
          },
        },
      },

      orderBy: {
        joinedAt: "desc",
      },

      skip,
      take: limit,
    }),

    prisma.equbMember.count({
      where,
    }),
  ]);

  return {
    members,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(
        total / limit
      ),
    },
  };
};

// get equb member by id
export const getEqubMemberByIdService = async ({
  memberId,
  condoId = null,
  equbId = null,
  requester,
}) => {
  const {
    error,
    value,
  } = equbMemberIdValidation.validate({
    id: memberId,
  });

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  checkAdmin(requester);

  const member =
    await prisma.equbMember.findFirst({
      where: {
        id: value.id,

        ...(condoId
          ? {
              equb: {
                condoId: String(
                  condoId
                ),
              },
            }
          : {}),

        ...(equbId
          ? {
              equbId: String(equbId),
            }
          : {}),
      },

      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            condoId: true,
            condoCode: true,
            block: true,
            roomNo: true,
            profilePhoto: true,
          },
        },

        equb: {
          include: {
            condo: {
              select: {
                id: true,
                condoCode: true,
                condoName: true,
                address: true,
              },
            },
          },
        },
      },
    });

  if (!member) {
    throw new AppError(
      "Equb member not found",
      404
    );
  }

  checkCondoAccess(
    requester,
    member.equb.condoId
  );

  return member;
};

// update equb member
export const updateEqubMemberService = async (
  memberId,
  payload,
  requester
) => {
  const {
    error,
    value,
  } = updateEqubMemberValidation.validate(
    payload
  );

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  checkAdmin(requester);

  const member =
    await prisma.equbMember.findUnique({
      where: {
        id: memberId,
      },
      include: {
        equb: true,
        user: true,
      },
    });

  if (!member) {
    throw new AppError(
      "Equb member not found",
      404
    );
  }

  checkCondoAccess(
    requester,
    member.equb.condoId
  );

  if (
    member.status === value.status
  ) {
    return member;
  }

  // active to inactive/suspended
  if (
    member.status === "active" &&
    (
      value.status === "inactive" ||
      value.status === "suspended"
    )
  ) {
    return prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.equbMember.update({
            where: {
              id: memberId,
            },
            data: {
              status: value.status,
              leftAt: new Date(),
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                  role: true,
                  condoId: true,
                  block: true,
                  roomNo: true,
                },
              },
              equb: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  noMembers: true,
                },
              },
            },
          });

        await tx.equb.update({
          where: {
            id: member.equbId,
          },
          data: {
            noMembers: {
              decrement: 1,
            },
          },
        });

        return updated;
      }
    );
  }

  // inactive/suspended to active
  if (
    (
      member.status === "inactive" ||
      member.status === "suspended"
    ) &&
    value.status === "active"
  ) {
    const anotherActive =
      await prisma.equbMember.findFirst({
        where: {
          userId: member.userId,
          status: "active",
          id: {
            not: memberId,
          },
        },
      });

    if (anotherActive) {
      throw new AppError(
        "User is already an active member of another Equb",
        409
      );
    }

    return prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.equbMember.update({
            where: {
              id: memberId,
            },
            data: {
              status: "active",
              leftAt: null,
            },
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                  role: true,
                  condoId: true,
                  block: true,
                  roomNo: true,
                },
              },
              equb: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  noMembers: true,
                },
              },
            },
          });

        await tx.equb.update({
          where: {
            id: member.equbId,
          },
          data: {
            noMembers: {
              increment: 1,
            },
          },
        });

        return updated;
      }
    );
  }

  throw new AppError(
    "Invalid member status transition",
    400
  );
};

// remove equb member
export const removeEqubMemberService = async (
  memberId,
  requester
) => {
  const {
    error,
    value,
  } = equbMemberIdValidation.validate({
    id: memberId,
  });

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  checkAdmin(requester);

  const member =
    await prisma.equbMember.findUnique({
      where: {
        id: value.id,
      },
      include: {
        equb: true,
        user: true,
      },
    });

  if (!member) {
    throw new AppError(
      "Equb member not found",
      404
    );
  }

  checkCondoAccess(
    requester,
    member.equb.condoId
  );

  if (
    member.status !== "active"
  ) {
    throw new AppError(
      "This user is not an active member of the Equb",
      400
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const updated =
        await tx.equbMember.update({
          where: {
            id: value.id,
          },
          data: {
            status: "inactive",
            leftAt: new Date(),
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                role: true,
                condoId: true,
                block: true,
                roomNo: true,
              },
            },
            equb: {
              select: {
                id: true,
                name: true,
                noMembers: true,
              },
            },
          },
        });

      await tx.equb.update({
        where: {
          id: member.equbId,
        },
        data: {
          noMembers: {
            decrement: 1,
          },
        },
      });

      return updated;
    }
  );
};