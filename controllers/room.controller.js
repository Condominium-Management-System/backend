import asyncHandler from "../utils/asyncHandler.js";

import {
  createRoomService,
  getAllRoomsService,
  getRoomByIdService,
  getAllRoomsServiceBySearch,
  getPublicRoomsService,
  getPublicRoomByIdService,
  getPublicRoomStatisticsService,
  updateRoomService,
  updateRoomStatusService,
  deleteRoomService,
  getAvailableRoomsService,
  getOccupiedRoomsService,
  getReservedRoomsService
} from "../services/room.service.js";

// CREATE ROOM
export const createRoom = asyncHandler(
  async (req, res) => {
    const room = await createRoomService(
      req.params.condoId,
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room
    });
  }
);

// PUBLIC GET ROOMS
export const getPublicRooms = asyncHandler(
  async (req, res) => {
    const rooms =
      await getPublicRoomsService({
        condoId: req.query.condoId,
        blockId: req.query.blockId,
        status: req.query.status,
        search: req.query.search,
        floorNo: req.query.floorNo,
        model: req.query.model
      });

    res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms
    });
  }
);

// PUBLIC SEARCH ROOMS
export const searchPublicRooms =
  asyncHandler(
    async (req, res) => {
      const rooms =
        await getPublicRoomsService({
          condoId: req.query.condoId,
          blockId: req.query.blockId,
          status: req.query.status,
          search: req.query.search,
          floorNo: req.query.floorNo,
          model: req.query.model
        });

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    }
  );

// PUBLIC GET ROOM BY ID
export const getPublicRoomById =
  asyncHandler(
    async (req, res) => {
      const room =
        await getPublicRoomByIdService(
          req.params.roomId
        );

      res.status(200).json({
        success: true,
        data: room
      });
    }
  );

// PUBLIC BLOCK STATISTICS
export const getPublicRoomStatistics =
  asyncHandler(
    async (req, res) => {
      const statistics =
        await getPublicRoomStatisticsService(
          req.params.blockId
        );

      res.status(200).json({
        success: true,
        data: statistics
      });
    }
  );

// ADMIN GET ALL ROOMS
export const getAllRooms =
  asyncHandler(
    async (req, res) => {
      const rooms =
        await getAllRoomsService({
          condoId:
            req.params.condoId || null,

          blockId:
            req.query.blockId,

          status:
            req.query.status,

          requester:
            req.user
        });

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    }
  );

// ADMIN SEARCH ROOMS
export const searchRooms =
  asyncHandler(
    async (req, res) => {
      const rooms =
        await getAllRoomsServiceBySearch({
          condoId:
            req.params.condoId || null,

          blockId:
            req.query.blockId,

          status:
            req.query.status,

          search:
            req.query.search,

          requester:
            req.user
        });

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    }
  );

// ADMIN GET ROOM BY ID
export const getRoomById =
  asyncHandler(
    async (req, res) => {
      const room =
        await getRoomByIdService(
          req.params.condoId || null,

          req.params.roomId ||
            req.params.id,

          req.user
        );

      res.status(200).json({
        success: true,
        data: room
      });
    }
  );

// UPDATE ROOM
export const updateRoom =
  asyncHandler(
    async (req, res) => {
      const room =
        await updateRoomService(
          req.params.condoId,
          req.params.roomId,
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

// UPDATE ROOM STATUS
export const updateRoomStatus =
  asyncHandler(
    async (req, res) => {
      const room =
        await updateRoomStatusService(
          req.params.condoId,
          req.params.roomId,
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

// GET AVAILABLE ROOMS
export const getAvailableRooms =
  asyncHandler(
    async (req, res) => {
      const rooms =
        await getAvailableRoomsService(
          req.params.condoId || null,
          req.user,
          req.query.blockId
        );

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    }
  );

// GET OCCUPIED ROOMS
export const getOccupiedRooms =
  asyncHandler(
    async (req, res) => {
      const rooms =
        await getOccupiedRoomsService(
          req.params.condoId || null,
          req.user,
          req.query.blockId
        );

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    }
  );

// GET RESERVED ROOMS
export const getReservedRooms =
  asyncHandler(
    async (req, res) => {
      const rooms =
        await getReservedRoomsService(
          req.params.condoId || null,
          req.user,
          req.query.blockId
        );

      res.status(200).json({
        success: true,
        count: rooms.length,
        data: rooms
      });
    }
  );

// DELETE ROOM
export const deleteRoom =
  asyncHandler(
    async (req, res) => {
      const result =
        await deleteRoomService(
          req.params.condoId,
          req.params.roomId,
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