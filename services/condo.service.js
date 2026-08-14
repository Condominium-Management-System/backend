import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";
import { generateCondoCode } from "../utils/condoCode.js";

import {
  createCondoValidation,
  updateCondoValidation
} from "../inputValidation/condo.validation.js";


// GENERATE UNIQUE CONDO CODE

const generateUniqueCondoCode = async () => {

  let condoCode;
  let exists = true;

  while (exists) {

    condoCode = generateCondoCode();

    exists = await prisma.condo.findUnique({
      where: {
        condoCode
      },
      select: {
        id: true
      }
    });
  }

  return condoCode;
};


// CREATE CONDOMINIUM

export const createCondoService = async (payload) => {

  const {
    error,
    value
  } = createCondoValidation.validate(payload);

  if (error) {

    throw new AppError(
      error.details
        .map((detail) => detail.message)
        .join(", "),
      400
    );
  }


  const condoCode =
    await generateUniqueCondoCode();


  const condo =
    await prisma.condo.create({

      data: {
        condoCode,

        condoName:
          value.condoName,

        address:
          value.address,

        city:
          value.city,

        gpsCoordinates:
          value.gpsCoordinates ?? null,

        maxAdmins:
          value.maxAdmins,

        blockNumbers:
          value.blockNumbers ?? [],

        customSettings:
          value.customSettings ?? null
      }
    });


  return condo;
};


// GET ALL CONDOMINIUMS

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


// GET ONE CONDOMINIUM

export const getCondoByIdService = async (id) => {

  const condo =
    await prisma.condo.findFirst({

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


// UPDATE CONDOMINIUM

export const updateCondoService = async (
  id,
  payload
) => {

  const {
    error,
    value
  } = updateCondoValidation.validate(payload);


  if (error) {

    throw new AppError(
      error.details
        .map((detail) => detail.message)
        .join(", "),
      400
    );
  }


  const existingCondo =
    await prisma.condo.findFirst({

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


  const data = {};


  // ==================================================
  // CONDO NAME
  // ==================================================

  if (value.condoName !== undefined) {
    data.condoName =
      value.condoName;
  }


  // ==================================================
  // ADDRESS
  // ==================================================

  if (value.address !== undefined) {
    data.address =
      value.address;
  }


  // ==================================================
  // CITY
  // ==================================================

  if (value.city !== undefined) {
    data.city =
      value.city;
  }


  // ==================================================
  // GPS
  // ==================================================

  if (value.gpsCoordinates !== undefined) {

    data.gpsCoordinates =
      value.gpsCoordinates;
  }


  // ==================================================
  // MAX ADMINS
  // ==================================================

  if (value.maxAdmins !== undefined) {

    data.maxAdmins =
      value.maxAdmins;
  }


  // ==================================================
  // BLOCK NUMBERS
  // ==================================================

  if (value.blockNumbers !== undefined) {

    data.blockNumbers =
      value.blockNumbers;
  }


  // ==================================================
  // ACTIVE STATUS
  // ==================================================

  if (value.activeStatus !== undefined) {

    data.activeStatus =
      value.activeStatus;
  }


  // ==================================================
  // CUSTOM SETTINGS
  // ==================================================

  if (value.customSettings !== undefined) {

    data.customSettings =
      value.customSettings;
  }


  if (Object.keys(data).length === 0) {

    throw new AppError(
      "No valid information was provided",
      400
    );
  }


  return prisma.condo.update({

    where: {
      id
    },

    data
  });
};


// DELETE CONDOMINIUM

export const deleteCondoService = async (id) => {

  const condo =
    await prisma.condo.findFirst({

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
export const getCondoByCodeService = async (condoCode) => {
  const condo = await prisma.condo.findFirst({
    where: {
      condoCode,
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

export const toggleCondoStatusService = async (id) => {
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

  return prisma.condo.update({
    where: {
      id
    },
    data: {
      activeStatus: !condo.activeStatus
    }
  });
};