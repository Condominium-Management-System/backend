import asyncHandler from "../utils/asyncHandler.js";

import {
  createBlockService,
  getAllBlocksService,
  getBlockByIdService,
  updateBlockService,
  deleteBlockService
} from "../services/block.service.js";

export const createBlock = asyncHandler(async (req, res) => {
  const block = await createBlockService(req.body);

  res.status(201).json({
    success: true,
    message: "Block created successfully",
    data: block
  });
});

export const getAllBlocks = asyncHandler(async (req, res) => {
  const blocks = await getAllBlocksService(
    req.query.condoId
  );

  res.status(200).json({
    success: true,
    data: blocks
  });
});

export const getBlockById = asyncHandler(async (req, res) => {
  const block = await getBlockByIdService(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: block
  });
});

export const updateBlock = asyncHandler(async (req, res) => {
  const block = await updateBlockService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Block updated successfully",
    data: block
  });
});

export const deleteBlock = asyncHandler(async (req, res) => {
  const result = await deleteBlockService(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Block deleted successfully",
    data: result
  });
});