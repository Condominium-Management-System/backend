import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  createBlockValidation,
  updateBlockValidation
} from "../inputValidation/block.validation.js";


// CREATE BLOCK

export const createBlockService = async (
  payload,
  requester
) => {

  const { error, value } =
    createBlockValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  const {
    condoId,
    blockNo,
    noRooms,
    noFloors
  } = value;


  const condo = await prisma.condo.findFirst({
    where: {
      id: condoId,
      deletedAt: null
    }
  });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }


  // CONDO ADMIN SCOPE

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== condo.id
  ) {
    throw new AppError(
      "You cannot create a block in another condominium",
      403
    );
  }


  // DUPLICATE BLOCK

  const existingBlock =
    await prisma.block.findFirst({
      where: {
        condoId,
        blockNo,
        deletedAt: null
      }
    });

  if (existingBlock) {
    throw new AppError(
      "Block number already exists in this condominium",
      409
    );
  }


  return prisma.block.create({
    data: {
      condoId,
      blockNo,
      noRooms,
      noFloors
    },

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true
        }
      }
    }
  });
};


// GET ALL BLOCKS

export const getAllBlocksService = async ({
  condoId,
  requester
} = {}) => {

  const where = {
    deletedAt: null
  };


  // CONDO ADMIN CAN ONLY SEE OWN CONDO

  if (
    requester?.role === "condo_admin"
  ) {
    where.condoId = requester.condoId;
  }


  // OPTIONAL CONDO FILTER

  if (condoId) {

    if (
      requester?.role === "condo_admin" &&
      condoId !== requester.condoId
    ) {
      throw new AppError(
        "You cannot access blocks from another condominium",
        403
      );
    }

    where.condoId = condoId;
  }


  return prisma.block.findMany({
    where,

    orderBy: {
      createdAt: "desc"
    },

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true
        }
      },

      _count: {
        select: {
          rooms: true
        }
      }
    }
  });
};


// GET ONE BLOCK

export const getBlockByIdService = async (
  blockId,
  requester
) => {

  const block =
    await prisma.block.findFirst({
      where: {
        id: String(blockId),
        deletedAt: null
      },

      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
            address: true,
            city: true
          }
        },

        _count: {
          select: {
            rooms: true
          }
        }
      }
    });


  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }


  // CONDO ADMIN SCOPE

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== block.condoId
  ) {
    throw new AppError(
      "You cannot access a block from another condominium",
      403
    );
  }


  return block;
};


// GET BLOCK WITH ROOM STATISTICS

export const getBlockStatisticsService = async (
  blockId,
  requester
) => {

  const block =
    await prisma.block.findFirst({
      where: {
        id: String(blockId),
        deletedAt: null
      }
    });


  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }


  // CONDO ADMIN SCOPE

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== block.condoId
  ) {
    throw new AppError(
      "You cannot access this block",
      403
    );
  }


  const [
    totalRooms,
    availableRooms,
    occupiedRooms,
    reservedRooms,
    maintenanceRooms
  ] = await Promise.all([

    prisma.room.count({
      where: {
        blockId: block.id,
        deletedAt: null
      }
    }),

    prisma.room.count({
      where: {
        blockId: block.id,
        status: "available",
        deletedAt: null
      }
    }),

    prisma.room.count({
      where: {
        blockId: block.id,
        status: "occupied",
        deletedAt: null
      }
    }),

    prisma.room.count({
      where: {
        blockId: block.id,
        status: "reserved",
        deletedAt: null
      }
    }),

    prisma.room.count({
      where: {
        blockId: block.id,
        status: "maintenance",
        deletedAt: null
      }
    })

  ]);


  const occupancyRate =
    totalRooms === 0
      ? 0
      : Number(
          (
            (occupiedRooms / totalRooms) *
            100
          ).toFixed(2)
        );


  return {
    block: {
      id: block.id,
      blockNo: block.blockNo,
      noRooms: block.noRooms,
      noFloors: block.noFloors,
      condoId: block.condoId
    },

    rooms: {
      total: totalRooms,
      available: availableRooms,
      occupied: occupiedRooms,
      reserved: reservedRooms,
      maintenance: maintenanceRooms
    },

    occupancyRate
  };
};


// UPDATE BLOCK

export const updateBlockService = async (
  blockId,
  payload,
  requester
) => {

  const { error, value } =
    updateBlockValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const block =
    await prisma.block.findFirst({
      where: {
        id: String(blockId),
        deletedAt: null
      }
    });


  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }


  // CONDO ADMIN SCOPE

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== block.condoId
  ) {
    throw new AppError(
      "You cannot modify a block from another condominium",
      403
    );
  }


  const data = {};


  // BLOCK NUMBER

  if (value.blockNo !== undefined) {

    if (
      value.blockNo !== block.blockNo
    ) {

      const existingBlock =
        await prisma.block.findFirst({
          where: {
            condoId: block.condoId,
            blockNo: value.blockNo,
            deletedAt: null,
            id: {
              not: block.id
            }
          }
        });

      if (existingBlock) {
        throw new AppError(
          "Block number already exists in this condominium",
          409
        );
      }
    }

    data.blockNo = value.blockNo;
  }


  // NUMBER OF ROOMS

  if (value.noRooms !== undefined) {

    const existingRooms =
      await prisma.room.count({
        where: {
          blockId: block.id,
          deletedAt: null
        }
      });


    if (
      value.noRooms < existingRooms
    ) {
      throw new AppError(
        `Number of rooms cannot be less than existing rooms (${existingRooms})`,
        400
      );
    }

    data.noRooms = value.noRooms;
  }


  // NUMBER OF FLOORS

  if (value.noFloors !== undefined) {

    data.noFloors =
      value.noFloors;
  }


  if (
    Object.keys(data).length === 0
  ) {
    throw new AppError(
      "No valid information was provided",
      400
    );
  }


  return prisma.block.update({
    where: {
      id: block.id
    },

    data,

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true
        }
      }
    }
  });
};


// DELETE BLOCK

export const deleteBlockService = async (
  blockId,
  requester
) => {

  const block =
    await prisma.block.findFirst({
      where: {
        id: String(blockId),
        deletedAt: null
      }
    });


  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }


  // CONDO ADMIN SCOPE

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== block.condoId
  ) {
    throw new AppError(
      "You cannot delete a block from another condominium",
      403
    );
  }


  // BLOCK CANNOT HAVE ACTIVE ROOMS

  const roomCount =
    await prisma.room.count({
      where: {
        blockId: block.id,
        deletedAt: null
      }
    });


  if (roomCount > 0) {
    throw new AppError(
      "Cannot delete a block that contains rooms",
      409
    );
  }


  await prisma.block.update({
    where: {
      id: block.id
    },

    data: {
      deletedAt: new Date()
    }
  });


  return {
    deleted: true
  };
};