import asyncHandler from "../utils/asyncHandler.js";

import {
  createCondoService,
  getAllCondosService,
  getCondoByIdService,
  getCondoByCodeService,
  updateCondoService,
  toggleCondoStatusService,
  deleteCondoService
} from "../services/condo.service.js";

// CREATE

export const createCondo = asyncHandler(async (req, res) => {
  const condo = await createCondoService(req.body);

  res.status(201).json({
    success: true,
    message: "Condominium created successfully",
    data: condo
  });
});

// GET ALL

export const getAllCondos = asyncHandler(async (req, res) => {
  const condos = await getAllCondosService();

  res.status(200).json({
    success: true,
    data: condos
  });
});

// GET BY ID

export const getCondoById = asyncHandler(async (req, res) => {
  const condo = await getCondoByIdService(req.params.id);

  res.status(200).json({
    success: true,
    data: condo
  });
});

// GET BY CODE

export const getCondoByCode = asyncHandler(async (req, res) => {
  const condo = await getCondoByCodeService(req.params.condoCode);

  res.status(200).json({
    success: true,
    data: condo
  });
});

// UPDATE

export const updateCondo = asyncHandler(async (req, res) => {
  const condo = await updateCondoService(
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Condominium updated successfully",
    data: condo
  });
});

// TOGGLE STATUS

export const toggleCondoStatus = asyncHandler(async (req, res) => {
  const condo = await toggleCondoStatusService(req.params.id);

  res.status(200).json({
    success: true,
    message: `Condominium ${
      condo.activeStatus ? "activated" : "deactivated"
    } successfully`,
    data: condo
  });
});

// DELETE

export const deleteCondo = asyncHandler(async (req, res) => {
  const result = await deleteCondoService(req.params.id);

  res.status(200).json({
    success: true,
    message: "Condominium deleted successfully",
    data: result
  });
});