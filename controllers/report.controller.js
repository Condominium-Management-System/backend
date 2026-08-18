
import * as reportService from "../services/report.service.js";
import asyncHandler from "../utils/asyncHandler.js";

// Get my reports (Resident sees only their own)
export const getMyReports = asyncHandler(async (req, res) => {
  const { status, category, priority, search, page, limit } = req.query;

  const result = await reportService.getMyReportsService(
    req.user.id,
    { status, category, priority, search, page, limit }
  );

  res.status(200).json({
    success: true,
    message: "Reports retrieved successfully",
    data: result
  });
});

// Get all reports for admin (Admin sees all)
export const getAllReportsForAdmin = asyncHandler(async (req, res) => {
  const { status, category, priority, search, page, limit } = req.query;

  const result = await reportService.getAllReportsForAdminService(
    req.user.id,
    { status, category, priority, search, page, limit }
  );

  res.status(200).json({
    success: true,
    message: "Reports retrieved successfully",
    data: result
  });
});

// Get single report by ID
export const getReportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await reportService.getReportByIdService(
    req.user.id,
    id
  );

  res.status(200).json({
    success: true,
    message: "Report retrieved successfully",
    data: result
  });
});

// Create a new report
export const createReport = asyncHandler(async (req, res) => {
  const result = await reportService.createReportService(
    req.user.id,
    req.body,
    req.file
  );

  // Emit socket event for real-time admin notification
  
  if (req.app.get('io')) {
    // Notify all admins in the condo
    req.app.get('io')
      .to(`admin_${result.condoId}`)
      .emit('newReport', result);
  }

  res.status(201).json({
    success: true,
    message: "Report created successfully. Admin will review it shortly.",
    data: result
  });
});

// Update report
export const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await reportService.updateReportService(
    req.user.id,
    req.user.role,
    id,
    req.body,
    req.file
  );

  res.status(200).json({
    success: true,
    message: "Report updated successfully",
    data: result
  });
});

// Delete report
export const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await reportService.deleteReportService(
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

// Add response to a report
export const addReportResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await reportService.addReportResponseService(
    req.user.id,
    id,
    req.body
  );

  // Emit socket event for real-time updates
  if (req.app.get('io')) {
    const report = await reportService.getReportByIdService(req.user.id, id);
    req.app.get('io')
      .to(`report_${id}`)
      .emit('newResponse', result);
  }

  res.status(201).json({
    success: true,
    message: "Response added successfully",
    data: result
  });
});

// Assign report to someone (Admin only)
export const assignReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await reportService.assignReportService(
    req.user.id,
    req.user.role,
    id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Report assigned successfully",
    data: result
  });
});

// Update report status (Admin only)
export const updateReportStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const result = await reportService.updateReportStatusService(
    req.user.id,
    req.user.role,
    id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Report status updated successfully",
    data: result
  });
});