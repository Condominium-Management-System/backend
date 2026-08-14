// controllers/lostFound.controller.js
import * as lostFoundService from "../services/lostFound.service.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAllLostFound = asyncHandler(async (req, res) => {
  const { type, category, status, search, page, limit } = req.query;

  const result = await lostFoundService.getAllLostFoundService(
    req.user.id,
    { type, category, status, search, page, limit }
  );

  res.status(200).json({
    success: true,
    message: "Lost/found items retrieved successfully",
    data: result
  });
});

export const getLostFoundById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await lostFoundService.getLostFoundByIdService(
    req.user.id,
    id
  );

  res.status(200).json({
    success: true,
    message: "Lost/found item retrieved successfully",
    data: result
  });
});

export const createLostFound = asyncHandler(async (req, res) => {
  const result = await lostFoundService.createLostFoundService(
    req.user.id,
    req.body,
    req.file // Pass the uploaded file
  );

  if (req.app.get('io')) {
    req.app.get('io')
      .to(`condo_${result.condoId}`)
      .emit('newLostFound', result);
  }

  res.status(201).json({
    success: true,
    message: `${result.type === 'lost' ? 'Lost' : 'Found'} item posted successfully`,
    data: result
  });
});

export const updateLostFound = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await lostFoundService.updateLostFoundService(
    req.user.id,
    req.user.role,
    id,
    req.body,
    req.file // Pass the uploaded file
  );

  if (req.app.get('io')) {
    req.app.get('io')
      .to(`condo_${result.condoId}`)
      .emit('lostFoundUpdated', result);
  }

  res.status(200).json({
    success: true,
    message: "Item updated successfully",
    data: result
  });
});

export const deleteLostFound = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await lostFoundService.deleteLostFoundService(
    req.user.id,
    req.user.role,
    id
  );

  if (req.app.get('io')) {
    req.app.get('io')
      .to(`condo_${req.user.condoId}`)
      .emit('lostFoundDeleted', { id });
  }

  res.status(200).json({
    success: true,
    message: result.message,
    data: { id }
  });
});

export const claimItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await lostFoundService.claimItemService(
    req.user.id,
    id,
    req.body
  );

  if (req.app.get('io')) {
    const io = req.app.get('io');
    
    io.to(`user_${result.userId}`).emit('claimRequested', {
      itemId: id,
      itemName: result.itemName,
      claimantName: req.user.fullName,
      claimantId: req.user.id
    });

    io.to(`condo_${result.condoId}`).emit('lostFoundUpdated', result);
  }

  res.status(200).json({
    success: true,
    message: "Claim request submitted successfully",
    data: result
  });
});

export const verifyClaim = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await lostFoundService.verifyClaimService(
    req.user.id,
    req.user.role,
    id
  );

  if (req.app.get('io')) {
    const io = req.app.get('io');
    
    io.to(`user_${result.userId}`).emit('claimVerified', {
      itemId: id,
      itemName: result.itemName,
      verifiedBy: req.user.fullName
    });
    
    io.to(`user_${result.claimedById}`).emit('claimVerified', {
      itemId: id,
      itemName: result.itemName,
      verifiedBy: req.user.fullName
    });

    io.to(`condo_${result.condoId}`).emit('lostFoundUpdated', result);
  }

  res.status(200).json({
    success: true,
    message: "Claim verified successfully",
    data: result
  });
});

export const archiveOldItems = asyncHandler(async (req, res) => {
  const { daysOld = 30 } = req.query;
  
  const result = await lostFoundService.archiveOldItemsService(
    req.user.id,
    req.user.role,
    parseInt(daysOld)
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: { archivedCount: result.count }
  });
});