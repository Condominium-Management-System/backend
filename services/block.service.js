import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";
import { blockValidation } from "../inputValidation/block.validation.js";

// ======================================================
// CREATE BLOCK
// ======================================================

export const createBlockService = async (payload) => {
  const {
    condoId,
    blockNo,
    noRooms,
    noFloors,
    occupiedRooms,
    availableRooms
  } = payload;
const {error} = blockValidation.validate(payload)
 if (
error
  ) {
    throw new AppError(
      error,
      400
    );
  }
  // Check condominium
  const condo = await prisma.condo.findFirst({
    where: {
      id: condoId,
      deletedAt: null,
      activeStatus: true
    }
  });

  if (!condo) {
    throw new AppError(
      "Active condominium not found",
      404
    );
  }

  // Check duplicate block
  const existingBlock = await prisma.block.findFirst({
    where: {
      condoId,
      blockNo,
      deletedAt: null
    }
  });

  if (existingBlock) {
    throw new AppError(
      `Block ${blockNo} already exists in this condominium`,
      409
    );
  }

  const block = await prisma.block.create({
    data: {
      condoId,
      blockNo,
      noRooms,
      noFloors,
      availableRooms,
      occupiedRooms
    }
  });

  return block;
};

// ======================================================
// GET ALL BLOCKS
// ======================================================

export const getAllBlocksService = async (condoId) => {
  return prisma.block.findMany({
    where: {
      condoId,
      deletedAt: null
    },
    include: {
      rooms: {
        where: {
          deletedAt: null
        }
      }
    },
    orderBy: {
      blockNo: "asc"
    }
  });
};

// ======================================================
// GET BLOCK
// ======================================================

export const getBlockByIdService = async (id) => {
  const block = await prisma.block.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      condo: true,
      rooms: {
        where: {
          deletedAt: null
        },
        orderBy: [
          {
            floorNo: "asc"
          },
          {
            roomNo: "asc"
          }
        ]
      }
    }
  });

  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }

  return block;
};

// ======================================================
// UPDATE BLOCK
// ======================================================

export const updateBlockService = async (id, payload) => {
  const block = await prisma.block.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }

  const {
    blockNo,
    noRooms,
    noFloors
  } = payload;

  // Don't allow noRooms to become smaller
  // than the number of existing rooms
  if (noRooms !== undefined) {
    const roomCount = await prisma.room.count({
      where: {
        blockId: id,
        deletedAt: null
      }
    });

    if (noRooms < roomCount) {
      throw new AppError(
        `Cannot set room capacity below existing room count (${roomCount})`,
        400
      );
    }
  }

  const updated = await prisma.block.update({
    where: {
      id
    },
    data: {
      blockNo,
      noRooms,
      noFloors
    }
  });

  // Recalculate counters
  await updateBlockRoomCounters(id);

  return prisma.block.findUnique({
    where: {
      id
    }
  });
};

// ======================================================
// DELETE BLOCK
// ======================================================

export const deleteBlockService = async (id) => {
  const block = await prisma.block.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }

  const roomCount = await prisma.room.count({
    where: {
      blockId: id,
      deletedAt: null
    }
  });

  if (roomCount > 0) {
    throw new AppError(
      "Cannot delete a block that still contains rooms",
      400
    );
  }

  await prisma.block.update({
    where: {
      id
    },
    data: {
      deletedAt: new Date()
    }
  });

  return {
    deleted: true
  };
};

// ======================================================
// UPDATE ROOM COUNTERS
// ======================================================

export const updateBlockRoomCounters = async (blockId) => {
  const [availableRooms, occupiedRooms] =
    await Promise.all([
      prisma.room.count({
        where: {
          blockId,
          status: "free",
          deletedAt: null
        }
      }),

      prisma.room.count({
        where: {
          blockId,
          status: "occupied",
          deletedAt: null
        }
      })
    ]);

  await prisma.block.update({
    where: {
      id: blockId
    },
    data: {
      availableRooms,
      occupiedRooms
    }
  });
};