import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";

import {
  createEqubValidation,
  updateEqubValidation,
  searchEqubValidation,
} from "../inputValidation/equb.validation.js";


// HELPERS

const isSuperAdmin = (user) =>
  user?.role === "super_admin";

const isCondoAdmin = (user) =>
  user?.role === "condo_admin";


// Check that the requested condo exists

const getCondo = async (condoId) => {

  const condo =
    await prisma.condo.findFirst({

      where: {
        id: String(condoId),
        deletedAt: null,
      },

      select: {
        id: true,
        condoCode: true,
        condoName: true,
        activeStatus: true,
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


// Check condo access

const checkCondoAccess = (
  requester,
  condoId
) => {

  // Super admin can access everything

  if (isSuperAdmin(requester)) {
    return true;
  }


  // Condo admin can only access own condo

  if (isCondoAdmin(requester)) {

    if (
      !requester.condoId ||
      requester.condoId !== String(condoId)
    ) {
      throw new AppError(
        "You can only manage Equbs in your own condominium",
        403
      );
    }

    return true;
  }


  throw new AppError(
    "You do not have permission to manage Equbs",
    403
  );
};


// CREATE EQUb

export const createEqubService = async (
  condoId,
  requester,
  payload
) => {

  const { error, value } =
    createEqubValidation.validate({
      ...payload,
      condoId,
    });


  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  // Only admins can create

  checkCondoAccess(
    requester,
    condoId
  );


  const condo =
    await getCondo(condoId);


  if (!condo.activeStatus) {
    throw new AppError(
      "Condominium is inactive",
      400
    );
  }


  const start =
    new Date(value.startDate);

  const due =
    new Date(value.dueDate);


  if (due <= start) {
    throw new AppError(
      "Due date must be after start date",
      400
    );
  }


  return prisma.equb.create({

    data: {

      condoId: condo.id,

      createdById: requester.id,

      name: value.name.trim(),

      contributionAmount:
        value.contributionAmount,

      startDate: start,

      dueDate: due,

      noMembers: 0,

      status: "pending",

    },

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

    },

  });

};


// GET ALL EQUbs


export const getAllEqubsService = async (
  condoId,
  requester,
  filters = {}
) => {

  
  // SUPER ADMIN
  

  if (isSuperAdmin(requester)) {

    const where = {
      deletedAt: null,
    };

    // Optional condo filter for super admin
    if (condoId) {
      await getCondo(condoId);

      where.condoId = String(condoId);
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.name) {
      where.name = {
        contains: filters.name.trim(),
        mode: "insensitive",
      };
    }

    return prisma.equb.findMany({

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

      },

      orderBy: {
        createdAt: "desc",
      },

    });
  }


   
  // CONDO ADMIN
  

  if (isCondoAdmin(requester)) {

    if (!condoId) {
      throw new AppError(
        "Condo ID is required",
        400
      );
    }

    // This guarantees condo admin can only access
    // their own condominium
    checkCondoAccess(
      requester,
      condoId
    );

    const where = {

      condoId: String(condoId),

      deletedAt: null,

    };


    if (filters.status) {
      where.status = filters.status;
    }


    if (filters.name) {
      where.name = {
        contains: filters.name.trim(),
        mode: "insensitive",
      };
    }


    return prisma.equb.findMany({

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

      },

      orderBy: {
        createdAt: "desc",
      },

    });
  }


  throw new AppError(
    "You do not have permission to access Equbs",
    403
  );
};


// SEARCH EQUbs


export const searchEqubsService = async (
  condoId,
  search,
  requester
) => {
  const { error, value } =
    searchEqubValidation.validate({ search });

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  const keyword = value.search.trim();

  const where = {
    deletedAt: null,
  };

  if (requester.role === "condo_admin") {
    if (!requester.condoId) {
      throw new AppError(
        "Condo admin is not assigned to a condominium",
        403
      );
    }

    if (
      condoId &&
      String(condoId) !== String(requester.condoId)
    ) {
      throw new AppError(
        "You can only search Equbs in your own condominium",
        403
      );
    }

    where.condoId = String(requester.condoId);
  }

  if (requester.role === "super_admin" && condoId) {
    where.condoId = String(condoId);
  }

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

  const validStatuses = [
    "pending",
    "active",
    "completed",
    "cancelled",
  ];

  if (
    validStatuses.includes(
      keyword.toLowerCase()
    )
  ) {
    where.OR.push({
      status: keyword.toLowerCase(),
    });
  }

  return prisma.equb.findMany({
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
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};


// GET EQUb BY ID

export const getEqubByIdService = async (
  condoId,
  equbId,
  requester
) => {


  // SUPER ADMIN


  if (isSuperAdmin(requester)) {

    const where = {

      id: String(equbId),

      deletedAt: null,

    };


    // Optional condo restriction
    if (condoId) {

      await getCondo(condoId);

      where.condoId =
        String(condoId);

    }


    const equb =
      await prisma.equb.findFirst({

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

        },

      });


    if (!equb) {
      throw new AppError(
        "Equb not found",
        404
      );
    }


    return equb;
  }


  // 
  // CONDO ADMIN
  // 

  if (isCondoAdmin(requester)) {

    if (!condoId) {
      throw new AppError(
        "Condo ID is required",
        400
      );
    }


    checkCondoAccess(
      requester,
      condoId
    );


    const equb =
      await prisma.equb.findFirst({

        where: {

          id: String(equbId),

          condoId: String(condoId),

          deletedAt: null,

        },

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

        },

      });


    if (!equb) {
      throw new AppError(
        "Equb not found in this condominium",
        404
      );
    }


    return equb;
  }


  throw new AppError(
    "You do not have permission to access this Equb",
    403
  );
};


// PUBLIC / USER EQUbs
// LIMITED INFORMATION

export const getPublicEqubsService = async (
  condoId
) => {

  await getCondo(condoId);


  return prisma.equb.findMany({

    where: {

      condoId: String(condoId),

      deletedAt: null,

      status: {
        not: "cancelled",
      },

    },

    select: {

      id: true,

      name: true,

      contributionAmount: true,

      startDate: true,

      dueDate: true,

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

    orderBy: {
      createdAt: "desc",
    },

  });

};




// PUBLIC GET ONE EQUb
// LIMITED INFORMATION

export const getPublicEqubByIdService = async (
  condoId,
  equbId
) => {

  const equb =
    await prisma.equb.findFirst({

      where: {

        id: String(equbId),

        condoId: String(condoId),

        deletedAt: null,

        status: {
          not: "cancelled",
        },

      },

      select: {

        id: true,

        name: true,

        contributionAmount: true,

        startDate: true,

        dueDate: true,

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

    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  return equb;
};



// UPDATE EQUb

export const updateEqubService = async (
  condoId,
  equbId,
  payload,
  requester
) => {

  checkCondoAccess(
    requester,
    condoId
  );


  const { error, value } =
    updateEqubValidation.validate(
      payload
    );


  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const equb =
    await prisma.equb.findFirst({

      where: {

        id: String(equbId),

        condoId: String(condoId),

        deletedAt: null,

      },

    });


  if (!equb) {
    throw new AppError(
      "Equb not found in this condominium",
      404
    );
  }


  const data = {};


  if (value.name !== undefined) {
    data.name =
      value.name.trim();
  }


  if (
    value.contributionAmount !==
    undefined
  ) {

    data.contributionAmount =
      value.contributionAmount;

  }


  if (value.startDate !== undefined) {
    data.startDate =
      new Date(value.startDate);
  }


  if (value.dueDate !== undefined) {
    data.dueDate =
      new Date(value.dueDate);
  }


  if (
    data.startDate &&
    data.dueDate &&
    data.dueDate <= data.startDate
  ) {

    throw new AppError(
      "Due date must be after start date",
      400
    );

  }


  if (value.status !== undefined) {
    data.status =
      value.status;
  }


  return prisma.equb.update({

    where: {
      id: equb.id,
    },

    data,

    include: {

      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
        },
      },

    },

  });

};


//delete Equb
export const deleteEqubService = async (
  condoId,
  equbId,
  requester
) => {

  const equb =
    await prisma.equb.findFirst({

      where: {

        id: String(equbId),

        condoId: String(condoId),

        deletedAt: null,

      },

    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  // Condo admin can delete
  // only own condominium Equbs

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot delete this Equb",
      403
    );
  }


  await prisma.equb.update({

    where: {
      id: equb.id,
    },

    data: {

      deletedAt:
        new Date(),

      status:
        "cancelled",

    },

  });


  return {
    deleted: true,
  };
};