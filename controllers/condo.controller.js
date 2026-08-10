import asyncHandler from "../utils/asyncHandler.js";

import {
  createCondoService,
  getAllCondosService,
  getCondoByIdService,
  updateCondoService,
  deleteCondoService
} from "../services/condo.service.js";

// ======================================================
// CREATE
// ======================================================

export const createCondo = asyncHandler(async (req, res) => {
  const condo = await createCondoService(req.body);

  res.status(201).json({
    success: true,
    message: "Condominium created successfully",
    data: condo
  });
});

// ======================================================
// GET ALL
// ======================================================

export const getAllCondos = asyncHandler(async (req, res) => {
  const condos = await getAllCondosService();

  res.status(200).json({
    success: true,
    data: condos
  });
});

// ======================================================
// GET ONE
// ======================================================

export const getCondoById = asyncHandler(async (req, res) => {
  const condo = await getCondoByIdService(
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: condo
  });
});

// ======================================================
// UPDATE
// ======================================================

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

// ======================================================
// DELETE
// ======================================================

export const deleteCondo = asyncHandler(async (req, res) => {
  const result = await deleteCondoService(
    req.params.id
  );

  res.status(200).json({
    success: true,
    message: "Condominium deleted successfully",
    data: result
  });
});

