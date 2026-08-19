import asyncHandler from "../utils/asyncHandler.js";

import {
  createEqubService,
  getAllEqubsService,
  getEqubByIdService,
  getPublicEqubsService,
  getPublicEqubByIdService,
  searchEqubsService,
  updateEqubService,
  deleteEqubService
} from "../services/equb.service.js";


// CREATE
// POST /api/condos/:condoId/equbs

export const createEqubController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equb =
      await createEqubService(
        condoId,
        req.user,
        req.body
      );


    res.status(201).json({

      success: true,

      message:
        "Equb created successfully",

      data: equb,

    });

  });


// ADMIN GET ALL

export const getAllEqubsController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equbs =
      await getAllEqubsService(

        condoId,

        req.user,

        {
          status:
            req.query.status,

          name:
            req.query.name,
        }

      );


    res.status(200).json({

      success: true,

      count:
        equbs.length,

      data:
        equbs,

    });

});

// SEARCH EQUbs

export const searchEqubsController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equbs =
      await searchEqubsService(

        condoId,

        req.query.search,

        req.user

      );


    res.status(200).json({

      success: true,

      count:
        equbs.length,

      data:
        equbs,

    });
});

// ADMIN GET ONE

export const getEqubByIdController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id
    } = req.params;


    const equb =
      await getEqubByIdService(

        condoId,

        id,

        req.user

      );


    res.status(200).json({

      success: true,

      data:
        equb,

    });

  });

// PUBLIC / USER GET ALL

export const getPublicEqubsController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equbs =
      await getPublicEqubsService(
        condoId
      );


    res.status(200).json({

      success: true,

      count: equbs.length,

      data: equbs,

    });

  });


// PUBLIC GET ONE

export const getPublicEqubByIdController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id
    } = req.params;


    const equb =
      await getPublicEqubByIdService(

        condoId,

        id

      );


    res.status(200).json({

      success: true,

      data: equb,

    });

  });


// UPDATE

export const updateEqubController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id
    } = req.params;


    const equb =
      await updateEqubService(

        condoId,

        id,

        req.body,

        req.user

      );


    res.status(200).json({

      success: true,

      message:
        "Equb updated successfully",

      data: equb,

    });

  });

  //delete equb
  export const deleteEqubController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id,
    } = req.params;

    const result =
      await deleteEqubService(
        condoId,
        id,
        req.user
      );

    res.status(200).json({

      success: true,

      message:
        "Equb deleted successfully",

      data:
        result,

    });

  });