import asyncHandler from "../utils/asyncHandler.js";

import {
  createRoomService,
  getAllRoomsService,
  getRoomByIdService,
  updateRoomService,
  updateRoomStatusService,
  deleteRoomService
} from "../services/room.service.js";

// CREATE
export const createRoom = asyncHandler(async (req, res) => {
  const room = await createRoomService(req.body);

  res.status(201).json({
    success: true,
    message: "Room created successfully",
    data: room
  });
});

// GET ALL
export const getAllRooms = asyncHandler(async (req, res) => {
  const rooms = await getAllRoomsService({
    condoId: req.query.condoId,
    blockId: req.query.blockId,
    status: req.query.status
  });

  res.status(200).json({
    success: true,
    data: rooms
  });
});

// GET ONE
export const getRoomById = asyncHandler(async (req, res) => {
  const room = await getRoomByIdService(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: room
  });
});

// UPDATE
export const updateRoom = asyncHandler(async (req, res) => {
  const room = await updateRoomService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Room updated successfully",
    data: room
  });
});

// STATUS
export const updateRoomStatus = asyncHandler(
  async (req, res) => {
    const { status, occupiedById } = req.body;

    const room = await updateRoomStatusService(
      req.params.id,
      status,
      occupiedById
    );

    res.status(200).json({
      success: true,
      message: "Room status updated successfully",
      data: room
    });
  }
);

// DELETE
export const deleteRoom = asyncHandler(async (req, res) => {
  const result = await deleteRoomService(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Room deleted successfully",
    data: result
  });
});