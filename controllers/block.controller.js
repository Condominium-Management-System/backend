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
// GET /api/blocks/:condoId/blocks/admin

export const getAllBlocks =
  asyncHandler(async (req, res) => {

    const condoId =
      req.params.condoId ||
      req.query.condoId ||
      req.user?.condoId;

    const blocks =
      await getAllBlocksService({

        condoId,

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
// GET /api/blocks/:condoId/blocks/:blockId/admin

export const getBlockById = asyncHandler(async (req, res) => {
  const condoId = req.params.condoId || req.user?.condoId;
  const blockId = req.params.blockId || req.params.id;

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
// GET /api/blocks/:condoId/blocks/:blockId/statistics

export const getBlockStatistics = asyncHandler(
  async (req, res) => {
    const condoId = req.params.condoId || req.user?.condoId;
    const blockId = req.params.blockId || req.params.id;

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
// POST /api/blocks/:condoId/blocks

export const createBlock =
  asyncHandler(async (req, res) => {

    const payload = {
      ...req.body,
      condoId: req.body.condoId || req.params.condoId || req.user?.condoId
    };

    const block =
      await createBlockService(

        payload,

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
// PATCH /api/blocks/:condoId/blocks/:blockId

export const updateBlock =
  asyncHandler(async (req, res) => {

    const blockId =
      req.params.blockId ||
      req.params.id;

    const block =
      await updateBlockService(

        blockId,

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
// DELETE /api/blocks/:condoId/blocks/:blockId

export const deleteBlock =
  asyncHandler(async (req, res) => {

    const blockId =
      req.params.blockId ||
      req.params.id;

    const result =
      await deleteBlockService(

        blockId,

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
