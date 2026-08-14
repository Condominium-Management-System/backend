import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  roomValidation,
  updateRoomSchema,
  updateRoomStatusSchema
} from "../inputValidation/room.validation.js";


const roomSelect = {

  id: true,

  condoId: true,

  blockId: true,

  roomNo: true,

  floorNo: true,

  price: true,

  model: true,

  status: true,

  occupiedById: true,

  createdAt: true,

  updatedAt: true,

  condo: {
    select: {
      id: true,
      condoCode: true,
      condoName: true
    }
  },

  block: {
    select: {
      id: true,
      blockNo: true
    }
  },

  occupiedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true
    }
  }

};


// ACCESS CHECK

const checkCondoAccess = (
  requester,
  condoId
) => {

  if (
    requester.role === "super_admin"
  ) {
    return;
  }


  if (
    !requester.condoId ||
    requester.condoId !== condoId
  ) {
    throw new AppError(
      "You cannot access rooms from another condominium",
      403
    );
  }

};


// CREATE ROOM

export const createRoomService = async (
  payload,
  requester
) => {

  const {
    error,
    value
  } = roomValidation.validate(payload);


  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  checkCondoAccess(
    requester,
    value.condoId
  );


  const condo =
    await prisma.condo.findFirst({
      where: {
        id: value.condoId,
        deletedAt: null
      }
    });


  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }


  const block =
    await prisma.block.findFirst({
      where: {
        id: value.blockId,
        condoId: value.condoId,
        deletedAt: null
      }
    });


  if (!block) {
    throw new AppError(
      "Block not found in this condominium",
      404
    );
  }


  const existingRoom =
    await prisma.room.findFirst({
      where: {
        blockId: value.blockId,
        roomNo: value.roomNo,
        deletedAt: null
      }
    });


  if (existingRoom) {
    throw new AppError(
      "Room number already exists in this block",
      409
    );
  }


  const room =
    await prisma.room.create({

      data: {

        condoId: value.condoId,

        blockId: value.blockId,

        roomNo: value.roomNo,

        floorNo: value.floorNo,

        price: value.price,

        model: value.model,

        status: "free"

      },

      select: roomSelect

    });


  return room;
};


// GET ALL ROOMS

export const getAllRoomsService = async ({
  requester,
  condoId,
  blockId,
  status
}) => {

  const where = {
    deletedAt: null
  };


  if (
    requester.role !== "super_admin"
  ) {

    where.condoId =
      requester.condoId;

  }


  if (
    requester.role === "super_admin" &&
    condoId
  ) {

    where.condoId = condoId;

  }


  if (blockId) {

    const block =
      await prisma.block.findFirst({
        where: {
          id: blockId,
          deletedAt: null
        }
      });


    if (!block) {
      throw new AppError(
        "Block not found",
        404
      );
    }


    checkCondoAccess(
      requester,
      block.condoId
    );


    where.blockId = blockId;
  }


  if (status) {

    if (
      ![
        "free",
        "occupied",
        "reserved"
      ].includes(status)
    ) {

      throw new AppError(
        "Invalid room status",
        400
      );

    }

    where.status = status;
  }


  return prisma.room.findMany({

    where,

    select: roomSelect,

    orderBy: [
      {
        blockId: "asc"
      },
      {
        floorNo: "asc"
      },
      {
        roomNo: "asc"
      }
    ]

  });
};


// GET ROOM BY ID

export const getRoomByIdService = async (
  roomId,
  requester
) => {

  const room =
    await prisma.room.findFirst({

      where: {
        id: String(roomId),
        deletedAt: null
      },

      select: roomSelect

    });


  if (!room) {

    throw new AppError(
      "Room not found",
      404
    );

  }


  checkCondoAccess(
    requester,
    room.condoId
  );


  return room;
};


// UPDATE ROOM

export const updateRoomService = async (
  roomId,
  payload,
  requester
) => {

  const {
    error,
    value
  } = updateRoomSchema.validate(
    payload
  );


  if (error) {

    throw new AppError(
      error.details[0].message,
      400
    );

  }


  const room =
    await prisma.room.findFirst({

      where: {
        id: String(roomId),
        deletedAt: null
      }

    });


  if (!room) {

    throw new AppError(
      "Room not found",
      404
    );

  }


  checkCondoAccess(
    requester,
    room.condoId
  );


  const data = {};


  if (
    value.roomNo !== undefined
  ) {

    const existingRoom =
      await prisma.room.findFirst({

        where: {
          blockId: room.blockId,
          roomNo: value.roomNo,
          deletedAt: null,
          NOT: {
            id: room.id
          }
        }

      });


    if (existingRoom) {

      throw new AppError(
        "Room number already exists in this block",
        409
      );

    }


    data.roomNo =
      value.roomNo;

  }


  if (
    value.floorNo !== undefined
  ) {

    if (
      value.floorNo >
      (
        await prisma.block.findUnique({
          where: {
            id: room.blockId
          },
          select: {
            noFloors: true
          }
        })
      ).noFloors
    ) {

      throw new AppError(
        "Room floor cannot exceed block floors",
        400
      );

    }


    data.floorNo =
      value.floorNo;

  }


  if (
    value.price !== undefined
  ) {

    data.price =
      value.price;

  }


  if (
    value.model !== undefined
  ) {

    data.model =
      value.model;

  }


  return prisma.room.update({

    where: {
      id: room.id
    },

    data,

    select: roomSelect

  });
};


// UPDATE ROOM STATUS

export const updateRoomStatusService = async (
  roomId,
  payload,
  requester
) => {

  const {
    error,
    value
  } =
    updateRoomStatusSchema.validate(
      payload
    );


  if (error) {

    throw new AppError(
      error.details[0].message,
      400
    );

  }


  const room =
    await prisma.room.findFirst({

      where: {
        id: String(roomId),
        deletedAt: null
      }

    });


  if (!room) {

    throw new AppError(
      "Room not found",
      404
    );

  }


  checkCondoAccess(
    requester,
    room.condoId
  );


  let occupiedById =
    null;


  if (
    value.status === "occupied"
  ) {

    const user =
      await prisma.user.findFirst({

        where: {
          id: value.occupiedById,
          deletedAt: null
        }

      });


    if (!user) {

      throw new AppError(
        "User not found",
        404
      );

    }


    if (
      user.condoId !== room.condoId
    ) {

      throw new AppError(
        "User does not belong to this condominium",
        400
      );

    }


    occupiedById =
      user.id;

  }


  if (
    value.status === "reserved"
  ) {

    occupiedById =
      value.occupiedById ?? null;

  }


  if (
    value.status === "free"
  ) {

    occupiedById =
      null;

  }


  return prisma.room.update({

    where: {
      id: room.id
    },

    data: {

      status:
        value.status,

      occupiedById

    },

    select: roomSelect

  });
};


// DELETE ROOM

export const deleteRoomService = async (
  roomId,
  requester
) => {

  const room =
    await prisma.room.findFirst({

      where: {
        id: String(roomId),
        deletedAt: null
      }

    });


  if (!room) {

    throw new AppError(
      "Room not found",
      404
    );

  }


  checkCondoAccess(
    requester,
    room.condoId
  );


  if (
    room.status === "occupied"
  ) {

    throw new AppError(
      "Occupied room cannot be deleted",
      400
    );

  }


  await prisma.room.update({

    where: {
      id: room.id
    },

    data: {

      deletedAt:
        new Date()

    }

  });


  return {
    deleted: true
  };
};


// GET AVAILABLE ROOMS

export const getAvailableRoomsService = async (
  requester,
  condoId,
  blockId
) => {

  return getAllRoomsService({

    requester,

    condoId,

    blockId,

    status: "free"

  });
};


// GET OCCUPIED ROOMS

export const getOccupiedRoomsService = async (
  requester,
  condoId,
  blockId
) => {

  return getAllRoomsService({

    requester,

    condoId,

    blockId,

    status: "occupied"

  });
};


// GET RESERVED ROOMS

export const getReservedRoomsService = async (
  requester,
  condoId,
  blockId
) => {

  return getAllRoomsService({

    requester,

    condoId,

    blockId,

    status: "reserved"

  });
};