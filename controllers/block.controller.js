import asyncHandler from "../utils/asyncHandler.js";

import {
  createBlockService,
  searchBlocksService,
  getPublicBlocksByCondoService,
  getPublicBlockByIdService,
  getAllBlocksService,
  getBlockByIdService,
  getBlockStatisticsService,
  updateBlockService,
  deleteBlockService
} from "../services/block.service.js";


// PUBLIC SEARCH
//
// GET /api/blocks/search

export const searchBlocks =
  asyncHandler(async (req, res) => {

    const {
      search,
      condoId
    } = req.query;


    const blocks =
      await searchBlocksService(
        search,
        {
          condoId
        }
      );


    res.status(200).json({

      success: true,

      count:
        blocks.length,

      data:
        blocks

    });

  });


// PUBLIC BLOCKS BY CONDO
//
// GET /api/condos/:condoId/blocks

export const getPublicBlocksByCondo =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const result =
      await getPublicBlocksByCondoService(

        condoId,

        {
          blockNo:
            req.query.blockNo
        }

      );


    res.status(200).json({

      success: true,

      data:
        result

    });

  });


// PUBLIC SINGLE BLOCK
//
// GET /api/condos/:condoId/blocks/:blockId

export const getPublicBlockById =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      blockId
    } = req.params;


    const block =
      await getPublicBlockByIdService(
        condoId,
        blockId
      );


    res.status(200).json({

      success: true,

      data:
        block

    });

  });


// ADMIN GET ALL
//
// GET /api/blocks

export const getAllBlocks =
  asyncHandler(async (req, res) => {

    const blocks =
      await getAllBlocksService({

        condoId:
          req.query.condoId,

        requester:
          req.user

      });


    res.status(200).json({

      success: true,

      count:
        blocks.length,

      data:
        blocks

    });

  });


// ADMIN GET ONE
//
// GET /api/blocks/:id

export const getBlockById = asyncHandler(async (req, res) => {
  const { condoId, blockId } = req.params;

  const block = await getBlockByIdService(
    condoId,
    blockId,
    req.user
  );

  res.status(200).json({
    success: true,
    data: block
  });
});


// ADMIN STATISTICS
//
// GET /api/blocks/:id/statistics

export const getBlockStatistics = asyncHandler(
  async (req, res) => {
    const {
      condoId,
      blockId
    } = req.params;

    const statistics =
      await getBlockStatisticsService(
        condoId,
        blockId,
        req.user
      );

    res.status(200).json({
      success: true,
      data: statistics
    });
  }
);


// CREATE
//
// POST /api/blocks

export const createBlock =
  asyncHandler(async (req, res) => {

    const block =
      await createBlockService(

        req.body,

        req.user

      );


    res.status(201).json({

      success: true,

      message:
        "Block created successfully",

      data:
        block

    });

  });


// UPDATE
//
// PATCH /api/blocks/:id

export const updateBlock =
  asyncHandler(async (req, res) => {

    const block =
      await updateBlockService(

        req.params.id,

        req.body,

        req.user

      );


    res.status(200).json({

      success: true,

      message:
        "Block updated successfully",

      data:
        block

    });

  });


// DELETE
//
// DELETE /api/blocks/:id

export const deleteBlock =
  asyncHandler(async (req, res) => {

    const result =
      await deleteBlockService(

        req.params.id,

        req.user

      );


    res.status(200).json({

      success: true,

      message:
        "Block deleted successfully",

      data:
        result

    });

  });