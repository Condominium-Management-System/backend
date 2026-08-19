import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  addIddirMemberValidation,
  updateIddirMemberValidation,
  iddirMemberIdValidation,
  iddirIdValidation,
} from "../inputValidation/iddirMemeber.validation.js";

const allowedRoles = [
  "super_admin",
  "condo_admin",
];

const memberSelect = {
  id: true,
  userId: true,
  iddirId: true,
  status: true,
  joinedAt: true,
  leftAt: true,
  totalPaid: true,

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
      isInIddir: true,
    },
  },

  iddir: {
    select: {
      id: true,
      name: true,
      condoId: true,
      status: true,
      contributionAmount: true,
      startedDate: true,
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
};

const checkAdminRole = (requester) => {
  if (
    !requester ||
    !allowedRoles.includes(requester.role)
  ) {
    throw new AppError(
      "You are not authorized to manage Iddir members",
      403
    );
  }
};

const validateCondoAccess = (
  requester,
  condoId
) => {
  checkAdminRole(requester);

  if (
    requester.role === "condo_admin" &&
    condoId &&
    String(requester.condoId) !== String(condoId)
  ) {
    throw new AppError(
      "You can only access members from your own condominium",
      403
    );
  }
};

const validateCondoExists = async (condoId) => {
  const condo = await prisma.condo.findFirst({
    where: {
      id: String(condoId),
      deletedAt: null,
    },
    select: {
      id: true,
      condoCode: true,
      condoName: true,
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

const getIddirWithAccess = async (
  iddirId,
  requester,
  condoId = null
) => {
  const iddir = await prisma.iddir.findFirst({
    where: {
      id: String(iddirId),
      deletedAt: null,
    },
    select: {
      id: true,
      condoId: true,
      name: true,
      status: true,
    },
  });

  if (!iddir) {
    throw new AppError(
      "Iddir not found",
      404
    );
  }

  if (
    condoId &&
    String(iddir.condoId) !== String(condoId)
  ) {
    throw new AppError(
      "Iddir does not belong to this condominium",
      403
    );
  }

  validateCondoAccess(
    requester,
    iddir.condoId
  );

  return iddir;
};

// Add Iddir member
export const addIddirMemberService = async (
  payload,
  requester
) => {
  const {
    error,
    value,
  } = addIddirMemberValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  checkAdminRole(requester);

  const iddir = await prisma.iddir.findFirst({
    where: {
      id: value.iddirId,
      deletedAt: null,
    },
  });

  if (!iddir) {
    throw new AppError(
      "Iddir not found",
      404
    );
  }

  const user = await prisma.user.findFirst({
    where: {
      id: value.userId,
      deletedAt: null,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      condoId: true,
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }

  // Condo admin can only manage own condo
  if (
    requester.role === "condo_admin" &&
    String(requester.condoId) !==
      String(iddir.condoId)
  ) {
    throw new AppError(
      "You can only manage members of your own condominium",
      403
    );
  }

  // User and Iddir must belong to same condo
  if (
    String(user.condoId) !==
    String(iddir.condoId)
  ) {
    throw new AppError(
      "User and Iddir must belong to the same condominium",
      400
    );
  }

  if (user.role !== "resident") {
    throw new AppError(
      "Only residents can become Iddir members",
      400
    );
  }

  if (iddir.status !== "active") {
    throw new AppError(
      "Cannot add a member to an inactive Iddir",
      400
    );
  }

  const existingMember =
    await prisma.iddirMember.findUnique({
      where: {
        iddirId_userId: {
          iddirId: value.iddirId,
          userId: value.userId,
        },
      },
    });

  if (existingMember) {
    if (
      existingMember.status === "active"
    ) {
      throw new AppError(
        "User is already an active member of this Iddir",
        409
      );
    }

    const member =
      await prisma.$transaction(
        async (tx) => {
          const updatedMember =
            await tx.iddirMember.update({
              where: {
                id: existingMember.id,
              },
              data: {
                status: "active",
                joinedAt: new Date(),
                leftAt: null,
              },
              select: memberSelect,
            });

          await tx.user.update({
            where: {
              id: value.userId,
            },
            data: {
              isInIddir: true,
            },
          });

          await tx.iddir.update({
            where: {
              id: value.iddirId,
            },
            data: {
              noMembers: {
                increment: 1,
              },
            },
          });

          return updatedMember;
        }
      );

    return member;
  }

  const activeMembership =
    await prisma.iddirMember.findFirst({
      where: {
        userId: value.userId,
        status: "active",
        iddirId: {
          not: value.iddirId,
        },
      },
    });

  if (activeMembership) {
    throw new AppError(
      "User is already an active member of another Iddir",
      409
    );
  }

  const member =
    await prisma.$transaction(
      async (tx) => {
        const newMember =
          await tx.iddirMember.create({
            data: {
              iddirId: value.iddirId,
              userId: value.userId,
              status: "active",
            },
            select: memberSelect,
          });

        await tx.user.update({
          where: {
            id: value.userId,
          },
          data: {
            isInIddir: true,
          },
        });

        await tx.iddir.update({
          where: {
            id: value.iddirId,
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

// Get Iddir members
export const getIddirMembersService = async ({
  condoId = null,
  iddirId = null,
  requester,
}) => {
  checkAdminRole(requester);

  if (condoId) {
    await validateCondoExists(condoId);

    validateCondoAccess(
      requester,
      condoId
    );
  }

  if (iddirId) {
    await getIddirWithAccess(
      iddirId,
      requester,
      condoId
    );
  }

  const where = {
    iddir: {
      deletedAt: null,
      ...(condoId
        ? {
            condoId: String(condoId),
          }
        : {}),
      ...(iddirId
        ? {
            id: String(iddirId),
          }
        : {}),
    },
  };

  if (requester.role === "condo_admin") {
    where.iddir.condoId =
      String(requester.condoId);
  }

  const members =
    await prisma.iddirMember.findMany({
      where,
      select: memberSelect,
      orderBy: {
        joinedAt: "desc",
      },
    });

  return members;
};

// Search Iddir members
export const searchIddirMembersService = async ({
  condoId = null,
  iddirId = null,
  search,
  status,
  requester,
}) => {
  checkAdminRole(requester);

  if (condoId) {
    await validateCondoExists(condoId);

    validateCondoAccess(
      requester,
      condoId
    );
  }

  if (iddirId) {
    await getIddirWithAccess(
      iddirId,
      requester,
      condoId
    );
  }

  const where = {
    iddir: {
      deletedAt: null,
    },
  };

  // Apply condominium restriction
  if (condoId) {
    where.iddir.condoId =
      String(condoId);
  }

  // Condo admin is always restricted
  if (requester.role === "condo_admin") {
    where.iddir.condoId =
      String(requester.condoId);
  }

  // Restrict to specific Iddir
  if (iddirId) {
    where.iddir.id =
      String(iddirId);
  }

  // Filter by member status
  if (status) {
    const validStatuses = [
      "active",
      "inactive",
      "suspended",
    ];

    if (
      !validStatuses.includes(status)
    ) {
      throw new AppError(
        "Invalid member status",
        400
      );
    }

    where.status = status;
  }

  if (
    search &&
    search.trim()
  ) {
    const keyword =
      search.trim();

    const searchNumber =
      Number(keyword);

    where.OR = [
      // Member ID
      {
        id: {
          equals: keyword,
        },
      },

      // User ID
      {
        userId: {
          equals: keyword,
        },
      },

      // Iddir ID
      {
        iddirId: {
          equals: keyword,
        },
      },

      // User
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
          condoCode: {
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
        user: {
          roomNo: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      // Iddir
      {
        iddir: {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
      },

      // Condo
      {
        iddir: {
          condo: {
            condoCode: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
      },

      {
        iddir: {
          condo: {
            condoName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
      },

      {
        iddir: {
          condo: {
            id: {
              equals: keyword,
            },
          },
        },
      },
    ];

    if (
      Number.isInteger(searchNumber)
    ) {
      where.OR.push(
        {
          user: {
            roomNo: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        }
      );
    }

    const normalized =
      keyword.toLowerCase();

    if (
      [
        "active",
        "inactive",
        "suspended",
      ].includes(normalized)
    ) {
      where.OR.push({
        status: normalized,
      });
    }
  }

  const members =
    await prisma.iddirMember.findMany({
      where,
      select: memberSelect,
      orderBy: {
        joinedAt: "desc",
      },
    });

  return members;
};

// Get Iddir member by ID
export const getIddirMemberByIdService =
  async (
    memberId,
    condoId = null,
    requester
  ) => {
    const {
      error,
      value,
    } = iddirMemberIdValidation.validate({
      id: memberId,
    });

    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }

    checkAdminRole(requester);

    if (condoId) {
      await validateCondoExists(condoId);

      validateCondoAccess(
        requester,
        condoId
      );
    }

    const member =
      await prisma.iddirMember.findFirst({
        where: {
          id: value.id,
          iddir: {
            deletedAt: null,
            ...(condoId
              ? {
                  condoId:
                    String(condoId),
                }
              : {}),
            ...(requester.role ===
            "condo_admin"
              ? {
                  condoId:
                    String(
                      requester.condoId
                    ),
                }
              : {}),
          },
        },
        select: memberSelect,
      });

    if (!member) {
      throw new AppError(
        "Iddir member not found",
        404
      );
    }

    return member;
  };

// Update Iddir member
export const updateIddirMemberService =
  async (
    memberId,
    condoId,
    payload,
    requester
  ) => {
    const {
      error,
      value,
    } = updateIddirMemberValidation.validate(
      payload
    );

    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }

    checkAdminRole(requester);

    if (condoId) {
      await validateCondoExists(condoId);

      validateCondoAccess(
        requester,
        condoId
      );
    }

    const member =
      await prisma.iddirMember.findFirst({
        where: {
          id: memberId,
          iddir: {
            deletedAt: null,
            ...(condoId
              ? {
                  condoId:
                    String(condoId),
                }
              : {}),
            ...(requester.role ===
            "condo_admin"
              ? {
                  condoId:
                    String(
                      requester.condoId
                    ),
                }
              : {}),
          },
        },
        include: {
          iddir: true,
          user: true,
        },
      });

    if (!member) {
      throw new AppError(
        "Iddir member not found",
        404
      );
    }

    if (
      member.status === value.status
    ) {
      return prisma.iddirMember.findUnique({
        where: {
          id: memberId,
        },
        select: memberSelect,
      });
    }

    // Active to inactive or suspended
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
            await tx.iddirMember.update({
              where: {
                id: memberId,
              },
              data: {
                status: value.status,
                leftAt: new Date(),
              },
              select: memberSelect,
            });

          const anotherActive =
            await tx.iddirMember.findFirst({
              where: {
                userId: member.userId,
                status: "active",
                id: {
                  not: memberId,
                },
              },
            });

          await tx.user.update({
            where: {
              id: member.userId,
            },
            data: {
              isInIddir:
                Boolean(anotherActive),
            },
          });

          await tx.iddir.update({
            where: {
              id: member.iddirId,
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

    // Inactive or suspended to active
    if (
      (
        member.status === "inactive" ||
        member.status === "suspended"
      ) &&
      value.status === "active"
    ) {
      const anotherActive =
        await prisma.iddirMember.findFirst({
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
          "User is already an active member of another Iddir",
          409
        );
      }

      if (
        member.iddir.status !== "active"
      ) {
        throw new AppError(
          "Cannot activate a member in an inactive Iddir",
          400
        );
      }

      return prisma.$transaction(
        async (tx) => {
          const updated =
            await tx.iddirMember.update({
              where: {
                id: memberId,
              },
              data: {
                status: "active",
                joinedAt:
                  member.joinedAt ||
                  new Date(),
                leftAt: null,
              },
              select: memberSelect,
            });

          await tx.user.update({
            where: {
              id: member.userId,
            },
            data: {
              isInIddir: true,
            },
          });

          await tx.iddir.update({
            where: {
              id: member.iddirId,
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

// Remove Iddir member
export const removeIddirMemberService =
  async (
    memberId,
    condoId,
    requester
  ) => {
    checkAdminRole(requester);

    if (condoId) {
      await validateCondoExists(condoId);

      validateCondoAccess(
        requester,
        condoId
      );
    }

    const member =
      await prisma.iddirMember.findFirst({
        where: {
          id: memberId,
          iddir: {
            deletedAt: null,
            ...(condoId
              ? {
                  condoId:
                    String(condoId),
                }
              : {}),
            ...(requester.role ===
            "condo_admin"
              ? {
                  condoId:
                    String(
                      requester.condoId
                    ),
                }
              : {}),
          },
        },
        include: {
          iddir: true,
          user: true,
        },
      });

    if (!member) {
      throw new AppError(
        "Iddir member not found",
        404
      );
    }

    if (member.status !== "active") {
      throw new AppError(
        "This user is not an active member of the Iddir",
        400
      );
    }

    return prisma.$transaction(
      async (tx) => {
        const updated =
          await tx.iddirMember.update({
            where: {
              id: memberId,
            },
            data: {
              status: "inactive",
              leftAt: new Date(),
            },
            select: memberSelect,
          });

        const anotherActive =
          await tx.iddirMember.findFirst({
            where: {
              userId: member.userId,
              status: "active",
              id: {
                not: memberId,
              },
            },
          });

        await tx.user.update({
          where: {
            id: member.userId,
          },
          data: {
            isInIddir:
              Boolean(anotherActive),
          },
        });

        await tx.iddir.update({
          where: {
            id: member.iddirId,
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