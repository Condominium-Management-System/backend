
import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";
import { generateCondoCode } from "../utils/condoCode.js";

// ======================================================
// GENERATE UNIQUE CONDO CODE
// ======================================================

const generateUniqueCondoCode = async () => {
  let condoCode;
  let exists = true;

  while (exists) {
    condoCode = generateCondoCode();

    exists = await prisma.condo.findUnique({
      where: {
        condoCode
      }
    });
  }

  return condoCode;
};

// ======================================================
// CREATE CONDOMINIUM
// ======================================================

export const createCondoService = async (payload) => {
  const {
    condoName,
    address,
    city,
    gpsCoordinates,
    maxAdmins,
    blockNumbers
  } = payload;

  const condoCode = await generateUniqueCondoCode();

  const condo = await prisma.condo.create({
    data: {
      condoCode,
      condoName,
      address,
      city,
      gpsCoordinates,
      maxAdmins: maxAdmins,
      blockNumbers: blockNumbers ?? []
    }
  });

  return condo;
};

// ======================================================
// GET ALL CONDOMINIUMS
// ======================================================

export const getAllCondosService = async () => {
  return prisma.condo.findMany({
    where: {
      deletedAt: null
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      _count: {
        select: {
          users: true,
          blocks: true,
          rooms: true
        }
      }
    }
  });
};

// ======================================================
// GET ONE CONDOMINIUM
// ======================================================

export const getCondoByIdService = async (id) => {
  const condo = await prisma.condo.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      _count: {
        select: {
          users: true,
          blocks: true,
          rooms: true
        }
      }
    }
  });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }

  return condo;
};

// ======================================================
// UPDATE CONDOMINIUM
// ======================================================

export const updateCondoService = async (id, payload) => {
  const existingCondo = await prisma.condo.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!existingCondo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }

  const {
    condoName,
    address,
    city,
    gpsCoordinates,
    maxAdmins,
    blockNumbers,
    activeStatus,
    customSettings
  } = payload;

  return prisma.condo.update({
    where: {
      id
    },
    data: {
      condoName,
      address,
      city,
      gpsCoordinates,
      maxAdmins,
      blockNumbers,
      activeStatus,
      customSettings
    }
  });
};

// ======================================================
// DELETE CONDOMINIUM
// ======================================================

export const deleteCondoService = async (id) => {
  const condo = await prisma.condo.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }

  await prisma.condo.update({
    where: {
      id
    },
    data: {
      deletedAt: new Date(),
      activeStatus: false
    }
  });

  return {
    deleted: true
  };
};

