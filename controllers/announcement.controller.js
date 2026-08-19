// controllers/announcement.controller.js
import * as announcementService from "../services/announcement.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get all announcements
 
export const getAllAnnouncements = asyncHandler(async (req, res) => {
  const { announcementType, isPinned, search, page, limit, condoId } = req.query;

  const result = await announcementService.getAllAnnouncementsService(
    req.user.id,
    { announcementType, isPinned, search, page, limit, condoId }
  );

  res.status(200).json({
    success: true,
    message: "Announcements retrieved successfully",
    data: result
  });
});

// Get single announcement by ID
 
export const getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await announcementService.getAnnouncementByIdService(
    req.user.id,
    id
  );

  res.status(200).json({
    success: true,
    message: "Announcement retrieved successfully",
    data: result
  });
});

 //Create a new announcement (Admin/Super Admin only)

export const createAnnouncement = asyncHandler(async (req, res) => {
  const result = await announcementService.createAnnouncementService(
    req.user.id,
    req.body,
    req.file
  );

  // Emit socket event for real-time updates
  if (req.app.get('io')) {
    req.app.get('io')
      .to(`condo_${result.condoId}`)
      .emit('newAnnouncement', result);
  }

  res.status(201).json({
    success: true,
    message: "Announcement created successfully",
    data: result
  });
});

// Update an announcement (Admin/Super Admin only)
 
export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await announcementService.updateAnnouncementService(
    req.user.id,
    req.user.role,
    id,
    req.body,
    req.file
  );

  // Emit socket event for real-time updates
  if (req.app.get('io')) {
    req.app.get('io')
      .to(`condo_${result.condoId}`)
      .emit('announcementUpdated', result);
  }

  res.status(200).json({
    success: true,
    message: "Announcement updated successfully",
    data: result
  });
});

// Delete an announcement (Admin/Super Admin only)
 
export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await announcementService.deleteAnnouncementService(
    req.user.id,
    req.user.role,
    id
  );

  // Emit socket event for real-time updates
  if (req.app.get('io')) {
    req.app.get('io')
      .to(`condo_${req.user.condoId}`)
      .emit('announcementDeleted', { id });
  }

  res.status(200).json({
    success: true,
    message: result.message,
    data: { id }
  });
});

// Get pinned announcements
 
export const getPinnedAnnouncements = asyncHandler(async (req, res) => {
  const { condoId } = req.query;
  
  const result = await announcementService.getPinnedAnnouncementsService(
    req.user.id,
    condoId
  );

  res.status(200).json({
    success: true,
    message: "Pinned announcements retrieved successfully",
    data: result
  });
});
//  Get all condos (for super admin)
 
export const getAllCondos = asyncHandler(async (req, res) => {
  const result = await announcementService.getAllCondosService(
    req.user.id
  );

  res.status(200).json({
    success: true,
    message: "Condos retrieved successfully",
    data: result
  });
});