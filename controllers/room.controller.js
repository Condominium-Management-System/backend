import asyncHandler from "../utils/asyncHandler.js";

import {
  createRoomService,
  getAllRoomsService,
  getRoomByIdService,
  updateRoomService,
  updateRoomStatusService,
  deleteRoomService,
  getAvailableRoomsService,
  getOccupiedRoomsService,
  getReservedRoomsService
} from "../services/room.service.js";


// CREATE

export const createRoom = asyncHandler(
  async (req, res) => {

    const room =
      await createRoomService(
        req.body,
        req.user
      );


    res.status(201).json({

      success: true,

      message:
        "Room created successfully",

      data: room

    });

  }
);


// GET ALL

export const getAllRooms = asyncHandler(
  async (req, res) => {

    const rooms =
      await getAllRoomsService({

        requester:
          req.user,

        condoId:
          req.query.condoId,

        blockId:
          req.query.blockId,

        status:
          req.query.status

      });


    res.status(200).json({

      success: true,

      data: rooms

    });

  }
);


// GET ONE

export const getRoomById = asyncHandler(
  async (req, res) => {

    const room =
      await getRoomByIdService(

        req.params.id,

        req.user

      );


    res.status(200).json({

      success: true,

      data: room

    });

  }
);


// UPDATE

export const updateRoom = asyncHandler(
  async (req, res) => {

    const room =
      await updateRoomService(

        req.params.id,

        req.body,

        req.user

      );


    res.status(200).json({

      success: true,

      message:
        "Room updated successfully",

      data: room

    });

  }
);


// UPDATE STATUS

export const updateRoomStatus =
  asyncHandler(
    async (req, res) => {

      const room =
        await updateRoomStatusService(

          req.params.id,

          req.body,

          req.user

        );


      res.status(200).json({

        success: true,

        message:
          "Room status updated successfully",

        data: room

      });

    }
  );


// AVAILABLE ROOMS

export const getAvailableRooms =
  asyncHandler(
    async (req, res) => {

      const rooms =
        await getAvailableRoomsService(

          req.user,

          req.query.condoId,

          req.query.blockId

        );


      res.status(200).json({

        success: true,

        data: rooms

      });

    }
  );


// OCCUPIED ROOMS

export const getOccupiedRooms =
  asyncHandler(
    async (req, res) => {

      const rooms =
        await getOccupiedRoomsService(

          req.user,

          req.query.condoId,

          req.query.blockId

        );


      res.status(200).json({

        success: true,

        data: rooms

      });

    }
  );


// RESERVED ROOMS

export const getReservedRooms =
  asyncHandler(
    async (req, res) => {

      const rooms =
        await getReservedRoomsService(

          req.user,

          req.query.condoId,

          req.query.blockId

        );


      res.status(200).json({

        success: true,

        data: rooms

      });

    }
  );


// DELETE

export const deleteRoom = asyncHandler(
  async (req, res) => {

    const result =
      await deleteRoomService(

        req.params.id,

        req.user

      );


    res.status(200).json({

      success: true,

      message:
        "Room deleted successfully",

      data: result

    });

  }
);