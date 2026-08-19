import AppError from "../errorhandler/AppError.js";

import { prisma } from "../config/prisma.config.js";

import {
  createIddirValidation,
  updateIddirValidation,
} from "../inputValidation/iddir.validation.js";

const publicIddirSelect = {
  id: true,
  name: true,
  startedDate: true,
  contributionAmount: true,
  status: true,
  noMembers: true,

  condo: {
    select: {
      id: true,
      condoCode: true,
      condoName: true,
    },
  },
};

const adminIddirInclude = {
  condo: {
    select: {
      id: true,
      condoCode: true,
      condoName: true,
      address: true,
      city: true,
    },
  },

  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
    },
  },

  members: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          block: true,
          roomNo: true,
        },
      },
    },
  },

  payments: {
    orderBy: {
      createdAt: "desc",
    },
  },

  _count: {
    select: {
      members: true,
      payments: true,
    },
  },
};

const adminIddirSelect = {
  id: true,
  condoId: true,
  name: true,
  startedDate: true,
  contributionAmount: true,
  status: true,
  noMembers: true,
  createdAt: true,
  updatedAt: true,

  condo: {
    select: {
      id: true,
      condoCode: true,
      condoName: true,
      address: true,
      city: true,
    },
  },

  createdBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
    },
  },

  _count: {
    select: {
      members: true,
      payments: true,
    },
  },
};

const checkAdminAccess = (
  requester,
  condoId = null
) => {
  if (!requester) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to manage Iddirs",
      403
    );
  }

  if (requester.role === "condo_admin") {
    if (!requester.condoId) {
      throw new AppError(
        "Your account is not assigned to a condominium",
        403
      );
    }

    if (
      condoId &&
      String(requester.condoId) !==
        String(condoId)
    ) {
      throw new AppError(
        "You can only access Iddirs from your own condominium",
        403
      );
    }
  }
};

const validateCondo = async (
  condoId
) => {
  const condo =
    await prisma.condo.findFirst({
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

// Create Iddir
export const createIddirService = async (
  condoId,
  payload,
  requester
) => {
  checkAdminAccess(
    requester,
    condoId
  );

  const {
    error,
    value,
  } = createIddirValidation.validate({
    ...payload,
    condoId,
  });

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  await validateCondo(
    condoId
  );

  const existingIddir =
    await prisma.iddir.findFirst({
      where: {
        condoId: String(condoId),
        name: value.name,
        deletedAt: null,
      },
    });

  if (existingIddir) {
    throw new AppError(
      "An Iddir with this name already exists in this condominium",
      409
    );
  }

  return prisma.iddir.create({
    data: {
      condoId: String(condoId),
      createdById: requester.id,
      name: value.name,
      startedDate: value.startedDate,
      contributionAmount:
        value.contributionAmount,
      status: "active",
      noMembers: 0,
    },
    select: adminIddirSelect,
  });
};

// Get public Iddirs
export const getPublicIddirsService =
  async ({
    condoId,
    status,
    search,
  } = {}) => {
    const where = {
      deletedAt: null,
    };

    if (condoId) {
      await validateCondo(
        condoId
      );

      where.condoId =
        String(condoId);
    }

    if (status) {
      if (
        ![
          "active",
          "inactive",
        ].includes(status)
      ) {
        throw new AppError(
          "Invalid Iddir status",
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

      where.OR = [
        {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          condo: {
            condoCode: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
        {
          condo: {
            condoName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    return prisma.iddir.findMany({
      where,
      select: publicIddirSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  };

// Get public Iddir by id
export const getPublicIddirByIdService =
  async (id) => {
    const iddir =
      await prisma.iddir.findFirst({
        where: {
          id: String(id),
          deletedAt: null,
        },
        select: publicIddirSelect,
      });

    if (!iddir) {
      throw new AppError(
        "Iddir not found",
        404
      );
    }

    return iddir;
  };

// Get admin Iddirs
export const getIddirsService = async ({
  condoId = null,
  requester,
  query = {},
}) => {
  checkAdminAccess(
    requester,
    condoId
  );

  const where = {
    deletedAt: null,
  };

  if (condoId) {
    await validateCondo(
      condoId
    );

    where.condoId =
      String(condoId);
  } else if (
    requester.role === "condo_admin"
  ) {
    where.condoId =
      String(requester.condoId);
  }

  if (query.status) {
    if (
      ![
        "active",
        "inactive",
      ].includes(query.status)
    ) {
      throw new AppError(
        "Invalid Iddir status",
        400
      );
    }

    where.status =
      query.status;
  }

  return prisma.iddir.findMany({
    where,
    select: adminIddirSelect,
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Search admin Iddirs
export const searchIddirsService =
  async ({
    condoId = null,
    requester,
    search,
    status,
  }) => {
    checkAdminAccess(
      requester,
      condoId
    );

    const where = {
      deletedAt: null,
    };

    if (condoId) {
      await validateCondo(
        condoId
      );

      where.condoId =
        String(condoId);
    } else if (
      requester.role === "condo_admin"
    ) {
      where.condoId =
        String(requester.condoId);
    }

    if (status) {
      if (
        ![
          "active",
          "inactive",
        ].includes(status)
      ) {
        throw new AppError(
          "Invalid Iddir status",
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

      where.OR = [
        {
          name: {
            contains: keyword,
            mode: "insensitive",
          },
        },
        {
          condo: {
            condoCode: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
        {
          condo: {
            condoName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
        {
          createdBy: {
            fullName: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
        {
          createdBy: {
            email: {
              contains: keyword,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    return prisma.iddir.findMany({
      where,
      select: adminIddirSelect,
      orderBy: {
        createdAt: "desc",
      },
    });
  };

// Get admin Iddir by id
export const getIddirByIdService =
  async (
    id,
    requester
  ) => {
    checkAdminAccess(
      requester
    );

    const iddir =
      await prisma.iddir.findFirst({
        where: {
          id: String(id),
          deletedAt: null,
        },
        include:
          adminIddirInclude,
      });

    if (!iddir) {
      throw new AppError(
        "Iddir not found",
        404
      );
    }

    if (
      requester.role === "condo_admin" &&
      String(iddir.condoId) !==
        String(requester.condoId)
    ) {
      throw new AppError(
        "You are not authorized to access this Iddir",
        403
      );
    }

    return iddir;
  };

// Update Iddir
export const updateIddirService =
  async (
    condoId,
    id,
    payload,
    requester
  ) => {
    checkAdminAccess(
      requester,
      condoId
    );

    const {
      error,
      value,
    } = updateIddirValidation.validate(
      payload
    );

    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }

    const existingIddir =
      await prisma.iddir.findFirst({
        where: {
          id: String(id),
          deletedAt: null,
        },
      });

    if (!existingIddir) {
      throw new AppError(
        "Iddir not found",
        404
      );
    }

    if (
      condoId &&
      String(existingIddir.condoId) !==
        String(condoId)
    ) {
      throw new AppError(
        "Iddir does not belong to this condominium",
        403
      );
    }

    if (
      requester.role === "condo_admin" &&
      String(existingIddir.condoId) !==
        String(requester.condoId)
    ) {
      throw new AppError(
        "You can only update Iddirs from your own condominium",
        403
      );
    }

    if (value.condoId) {
      if (
        requester.role === "condo_admin" &&
        String(value.condoId) !==
          String(requester.condoId)
      ) {
        throw new AppError(
          "You cannot move an Iddir to another condominium",
          403
        );
      }

      await validateCondo(
        value.condoId
      );
    }

    if (value.name) {
      const duplicate =
        await prisma.iddir.findFirst({
          where: {
            condoId:
              value.condoId ??
              existingIddir.condoId,
            name: value.name,
            id: {
              not: String(id),
            },
            deletedAt: null,
          },
        });

      if (duplicate) {
        throw new AppError(
          "Another Iddir with this name already exists",
          409
        );
      }
    }

    return prisma.iddir.update({
      where: {
        id: String(id),
      },
      data: value,
      select: adminIddirSelect,
    });
  };

// Delete Iddir
export const deleteIddirService =
  async (
    condoId,
    id,
    requester
  ) => {
    checkAdminAccess(
      requester,
      condoId
    );

    const iddir =
      await prisma.iddir.findFirst({
        where: {
          id: String(id),
          deletedAt: null,
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
      String(iddir.condoId) !==
        String(condoId)
    ) {
      throw new AppError(
        "Iddir does not belong to this condominium",
        403
      );
    }

    if (
      requester.role === "condo_admin" &&
      String(iddir.condoId) !==
        String(requester.condoId)
    ) {
      throw new AppError(
        "You can only delete Iddirs from your own condominium",
        403
      );
    }

    const memberCount =
      await prisma.iddirMember.count({
        where: {
          iddirId: String(id),
        },
      });

    if (memberCount > 0) {
      throw new AppError(
        "Cannot delete an Iddir that has members",
        400
      );
    }

    return prisma.iddir.update({
      where: {
        id: String(id),
      },
      data: {
        deletedAt: new Date(),
        status: "inactive",
      },
    });
  };