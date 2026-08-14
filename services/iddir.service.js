import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  createIddirValidation,
  updateIddirValidation,
} from "../inputValidation/iddir.validation.js";
export const createIddirService = async (payload, requester) => {

  const {
    error,
    value,
  } = createIddirValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  // Only super_admin or condo_admin
  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to create an Iddir",
      403
    );
  }


  // Condo admin can only create Iddir
  // inside their own condominium
  if (
    requester.role === "condo_admin" &&
    requester.condoId !== value.condoId
  ) {
    throw new AppError(
      "You can only create Iddir for your own condominium",
      403
    );
  }


  // Check condo exists
  const condo = await prisma.condo.findUnique({
    where: {
      id: value.condoId,
    },
  });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }


  // Check duplicate Iddir name
  const existingIddir = await prisma.iddir.findFirst({
    where: {
      condoId: value.condoId,
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


  const iddir = await prisma.iddir.create({
    data: {
      condoId: value.condoId,

      createdById: requester.id,

      name: value.name,

      startedDate: value.startedDate,

      contributionAmount: value.contributionAmount,

      status: "active",

      noMembers: 0,
    },

    include: {
      condo: true,

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },

      _count: {
        select: {
          members: true,
          payments: true,
        },
      },
    },
  });


  return iddir;
};

export const getIddirsService = async (requester) => {

  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to view Iddirs",
      403
    );
  }


  const where = {
    deletedAt: null,
  };


  // Condo admin sees only their condo
  if (requester.role === "condo_admin") {

    where.condoId = requester.condoId;

  }


  const iddirs = await prisma.iddir.findMany({

    where,

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },

      members: {
        select: {
          id: true,
          userId: true,
          status: true,
          joinedAt: true,
          totalPaid: true,
        },
      },

      _count: {
        select: {
          members: true,
          payments: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });


  return iddirs;
};


export const getIddirByIdService = async (
  id,
  requester
) => {

  const iddir = await prisma.iddir.findFirst({

    where: {
      id,
      deletedAt: null,
    },

    include: {

      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
          address: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
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
    },
  });


  if (!iddir) {
    throw new AppError(
      "Iddir not found",
      404
    );
  }


  // Condo admin access check
  if (
    requester.role === "condo_admin" &&
    iddir.condoId !== requester.condoId
  ) {
    throw new AppError(
      "You are not authorized to access this Iddir",
      403
    );
  }


  return iddir;
};

export const updateIddirService = async (
  id,
  payload,
  requester
) => {

  const {
    error,
    value,
  } = updateIddirValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const existingIddir = await prisma.iddir.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });


  if (!existingIddir) {
    throw new AppError(
      "Iddir not found",
      404
    );
  }


  // Authorization
  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to update this Iddir",
      403
    );
  }


  // Condo admin can only update own condo
  if (
    requester.role === "condo_admin" &&
    existingIddir.condoId !== requester.condoId
  ) {
    throw new AppError(
      "You can only update Iddir from your own condominium",
      403
    );
  }


  // If changing condo
  if (value.condoId) {

    if (
      requester.role === "condo_admin" &&
      value.condoId !== requester.condoId
    ) {
      throw new AppError(
        "You cannot move an Iddir to another condominium",
        403
      );
    }


    const condo = await prisma.condo.findUnique({
      where: {
        id: value.condoId,
      },
    });


    if (!condo) {
      throw new AppError(
        "Condominium not found",
        404
      );
    }
  }


  // Check duplicate name
  if (value.name) {

    const duplicate = await prisma.iddir.findFirst({

      where: {
        condoId: value.condoId ?? existingIddir.condoId,

        name: value.name,

        id: {
          not: id,
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


  const updatedIddir = await prisma.iddir.update({

    where: {
      id,
    },

    data: value,

    include: {

      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },

      _count: {
        select: {
          members: true,
          payments: true,
        },
      },
    },
  });


  return updatedIddir;
};

export const deleteIddirService = async (
  id,
  requester
) => {

  const iddir = await prisma.iddir.findFirst({
    where: {
      id,
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
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to delete this Iddir",
      403
    );
  }


  if (
    requester.role === "condo_admin" &&
    iddir.condoId !== requester.condoId
  ) {
    throw new AppError(
      "You can only delete Iddir from your own condominium",
      403
    );
  }


  // Don't delete an Iddir that has members
  const memberCount = await prisma.iddirMember.count({
    where: {
      iddirId: id,
    },
  });


  if (memberCount > 0) {
    throw new AppError(
      "Cannot delete an Iddir that has members",
      400
    );
  }


  const deletedIddir = await prisma.iddir.update({

    where: {
      id,
    },

    data: {
      deletedAt: new Date(),
      status: "inactive",
    },
  });


  return deletedIddir;
};