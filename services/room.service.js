import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";
import { updateBlockRoomCounters } from "./block.service.js";
import { roomValidation } from "../inputValidation/room.validation.js";

// ======================================================
// CREATE ROOM
// ======================================================

export const createRoomService = async (payload) => {
  const {
    condoId,
    blockId,
    roomNo,
    floorNo,
    price,
    model
  } = payload;
const {error} = roomValidation.validate(payload)
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

  // Check block
  const block = await prisma.block.findFirst({
    where: {
      id: blockId,
      condoId,
      deletedAt: null
    }
  });

  if (!block) {
    throw new AppError(
      "Block does not belong to this condominium",
      400
    );
  }

  // Check capacity
  const existingRoomCount = await prisma.room.count({
    where: {
      blockId,
      deletedAt: null
    }
  });

  if (existingRoomCount >= block.noRooms) {
    throw new AppError(
      "This block has reached its maximum room capacity",
      400
    );
  }

  // Check duplicate room
  const existingRoom = await prisma.room.findFirst({
    where: {
      blockId,
      roomNo,
      deletedAt: null
    }
  });

  if (existingRoom) {
    throw new AppError(
      `Room ${roomNo} already exists in this block`,
      409
    );
  }

  // Check floor
  if (floorNo > block.noFloors) {
    throw new AppError(
      `Floor ${floorNo} does not exist in this block. Maximum floor is ${block.noFloors}`,
      400
    );
  }

  const room = await prisma.room.create({
    data: {
      condoId,
      blockId,
      roomNo,
      floorNo,
      price,
      model,
      status: "free"
    }
  });

  await updateBlockRoomCounters(blockId);

  return room;
};

// ======================================================
// GET ALL ROOMS
// ======================================================

export const getAllRoomsService = async ({
  condoId,
  blockId,
  status
}) => {
  return prisma.room.findMany({
    where: {
      condoId,
      blockId,
      status,
      deletedAt: null
    },
    include: {
      block: true,
      occupiedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true
        }
      }
    },
    orderBy: [
      {
        floorNo: "asc"
      },
      {
        roomNo: "asc"
      }
    ]
  });
};

// ======================================================
// GET ONE ROOM
// ======================================================

export const getRoomByIdService = async (id) => {
  const room = await prisma.room.findFirst({
    where: {
      id,
      deletedAt: null
    },
    include: {
      condo: true,
      block: true,
      occupiedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true
        }
      }
    }
  });

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  return room;
};

// ======================================================
// UPDATE ROOM
// ======================================================

export const updateRoomService = async (
  id,
  payload
) => {
  const room = await prisma.room.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  if (payload.floorNo !== undefined) {
    const block = await prisma.block.findUnique({
      where: {
        id: room.blockId
      }
    });

    if (payload.floorNo > block.noFloors) {
      throw new AppError(
        `Floor ${payload.floorNo} does not exist in this block`,
        400
      );
    }
  }

  const updatedRoom = await prisma.room.update({
    where: {
      id
    },
    data: payload
  });

  return updatedRoom;
};

// ======================================================
// UPDATE ROOM STATUS
// ======================================================

export const updateRoomStatusService = async (
  id,
  status,
  occupiedById = null
) => {
  const room = await prisma.room.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  // FREE
  if (status === "free") {
    const updatedRoom = await prisma.room.update({
      where: {
        id
      },
      data: {
        status: "free",
        occupiedById: null
      }
    });

    await updateBlockRoomCounters(
      room.blockId
    );

    return updatedRoom;
  }

  // OCCUPIED
  if (status === "occupied") {
    if (!occupiedById) {
      throw new AppError(
        "An occupant is required when a room is occupied",
        400
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: occupiedById,
        deletedAt: null
      }
    });

    if (!user) {
      throw new AppError(
        "Occupant not found",
        404
      );
    }

    // Make sure resident belongs to same condo
    if (user.condoId !== room.condoId) {
      throw new AppError(
        "User does not belong to this condominium",
        400
      );
    }

    const updatedRoom = await prisma.room.update({
      where: {
        id
      },
      data: {
        status: "occupied",
        occupiedById
      }
    });

    await updateBlockRoomCounters(
      room.blockId
    );

    return updatedRoom;
  }

  // RESERVED
  if (status === "reserved") {
    const updatedRoom = await prisma.room.update({
      where: {
        id
      },
      data: {
        status: "reserved",
        occupiedById: null
      }
    });

    await updateBlockRoomCounters(
      room.blockId
    );

    return updatedRoom;
  }

  throw new AppError(
    "Invalid room status",
    400
  );
};

// ======================================================
// DELETE ROOM
// ======================================================

export const deleteRoomService = async (id) => {
  const room = await prisma.room.findFirst({
    where: {
      id,
      deletedAt: null
    }
  });

  if (!room) {
    throw new AppError(
      "Room not found",
      404
    );
  }

  if (room.status === "occupied") {
    throw new AppError(
      "An occupied room cannot be deleted",
      400
    );
  }

  await prisma.room.update({
    where: {
      id
    },
    data: {
      deletedAt: new Date()
    }
  });

  await updateBlockRoomCounters(
    room.blockId
  );

  return {
    deleted: true
  };
};