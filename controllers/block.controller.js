import asyncHandler from "../utils/asyncHandler.js";

import {
  createBlockService,
  getAllBlocksService,
  getBlockByIdService,
  getBlockStatisticsService,
  updateBlockService,
  deleteBlockService
} from "../services/block.service.js";


// CREATE

export const createBlock = asyncHandler(
  async (req, res) => {

    const block =
      await createBlockService(
        req.body,
        req.user
      );

    res.status(201).json({
      success: true,
      message: "Block created successfully",
      data: block
    });
  }
);


// GET ALL

export const getAllBlocks = asyncHandler(
  async (req, res) => {

    const blocks =
      await getAllBlocksService({
        condoId: req.query.condoId,
        requester: req.user
      });

    res.status(200).json({
      success: true,
      data: blocks
    });
  }
);


// GET ONE

export const getBlockById = asyncHandler(
  async (req, res) => {

    const block =
      await getBlockByIdService(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      data: block
    });
  }
);


// GET STATISTICS

export const getBlockStatistics =
  asyncHandler(
    async (req, res) => {

      const statistics =
        await getBlockStatisticsService(
          req.params.id,
          req.user
        );

      res.status(200).json({
        success: true,
        data: statistics
      });
    }
  );


// UPDATE

export const updateBlock = asyncHandler(
  async (req, res) => {

    const block =
      await updateBlockService(
        req.params.id,
        req.body,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Block updated successfully",
      data: block
    });
  }
);


// DELETE

export const deleteBlock = asyncHandler(
  async (req, res) => {

    const result =
      await deleteBlockService(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Block deleted successfully",
      data: result
    });
  }
);