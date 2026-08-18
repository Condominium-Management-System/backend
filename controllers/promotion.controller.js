// controllers/promotion.controller.js
import * as promotionService from "../services/promotion.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all promotions (Public)
export const getAllPromotions = asyncHandler(async (req, res) => {
  const { type, category, status, search, page, limit } = req.query;

  const result = await promotionService.getAllPromotionsService({
    type,
    category,
    status: status || 'active',
    search,
    page,
    limit
  });

  res.status(200).json({
    success: true,
    message: "Promotions retrieved successfully",
    data: result
  });
});

// Get single promotion by ID (Public)
export const getPromotionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await promotionService.getPromotionByIdService(id);

  res.status(200).json({
    success: true,
    message: "Promotion retrieved successfully",
    data: result
  });
});

// Create a new promotion (Admin/Super Admin only)
export const createPromotion = asyncHandler(async (req, res) => {
  const result = await promotionService.createPromotionService(
    req.user.id,
    req.body,
    req.files
  );

  res.status(201).json({
    success: true,
    message: "Promotion created successfully. Waiting for admin review.",
    data: result
  });
});

// Review/Approve a promotion (Admin/Super Admin only)
export const reviewPromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await promotionService.reviewPromotionService(
    req.user.id,
    req.user.role,
    id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: `Promotion ${result.status === 'approved' ? 'approved' : 'rejected'} successfully`,
    data: result
  });
});

// Update a promotion (Admin/Super Admin only)
export const updatePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await promotionService.updatePromotionService(
    req.user.id,
    req.user.role,
    id,
    req.body,
    req.files
  );

  res.status(200).json({
    success: true,
    message: "Promotion updated successfully",
    data: result
  });
});

// Delete a promotion (Admin/Super Admin only)
export const deletePromotion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await promotionService.deletePromotionService(
    req.user.id,
    req.user.role,
    id
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: { id }
  });
});

// Track promotion click (Public)
export const trackClick = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  await promotionService.trackPromotionClickService(id);

  res.status(200).json({
    success: true,
    message: "Click tracked successfully"
  });
});