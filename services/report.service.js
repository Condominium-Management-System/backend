
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";

// Get all reports for the current user (Resident sees only their own)
export const getMyReportsService = async (userId, filters = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const { status, category, priority, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      condoId: user.condoId,
      reporterId: userId,
      deletedAt: null
    };

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profilePhoto: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          responses: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  profilePhoto: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.report.count({ where })
    ]);

    return {
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch reports", 500);
  }
};

// Get all reports for admin (Admin sees all reports in their condo)
export const getAllReportsForAdminService = async (userId, filters = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    // Only admin or super_admin can access all reports
    if (!['condo_admin', 'super_admin'].includes(user.role)) {
      throw new AppError("Only admins can view all reports", 403);
    }

    const { status, category, priority, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      condoId: user.condoId,
      deletedAt: null
    };

    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profilePhoto: true,
              roomNo: true,
              block: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          responses: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  profilePhoto: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.report.count({ where })
    ]);

    return {
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch reports", 500);
  }
};

// Get single report by ID (Resident sees only their own, Admin sees all)
export const getReportByIdService = async (userId, reportId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const where = {
      id: reportId,
      condoId: user.condoId,
      deletedAt: null
    };

    // If not admin, only show their own reports
    if (!['condo_admin', 'super_admin'].includes(user.role)) {
      where.reporterId = userId;
    }

    const report = await prisma.report.findFirst({
      where,
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true,
            roomNo: true,
            block: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!report) {
      throw new AppError("Report not found", 404);
    }

    return report;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch report", 500);
  }
};

// Create a new report (Resident only)
export const createReportService = async (userId, data, file = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, condoId: true, fullName: true, role: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const { title, description, category, priority, photoUrl } = data;

    let finalPhotoUrl = photoUrl || null;
    if (file) {
      if (file.path) {
        finalPhotoUrl = `/uploads/reports/${file.filename}`;
      } else if (file.secure_url) {
        finalPhotoUrl = file.secure_url;
      }
    }

    const newReport = await prisma.report.create({
      data: {
        title,
        description,
        category,
        priority,
        photoUrl: finalPhotoUrl,
        status: 'reported',
        reporterId: user.id,
        reporterRole: user.role === 'super_admin' ? 'super_admin' : 
                     user.role === 'condo_admin' ? 'admin' : 'resident',
        condoId: user.condoId
      },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true
          }
        }
      }
    });

    return newReport;
  } catch (error) {
    console.error('Create report error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create report", 500);
  }
};

// Update report (Reporter can update their own, Admin can update any)
export const updateReportService = async (userId, userRole, reportId, data, file = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        id: reportId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    // Check authorization
    const isAdmin = ['condo_admin', 'super_admin'].includes(userRole);
    const isReporter = existingReport.reporterId === userId;

    if (!isAdmin && !isReporter) {
      throw new AppError("You are not authorized to update this report", 403);
    }

    // If reporter is updating, only allow certain fields
    let updateData = { ...data };
    if (!isAdmin && isReporter) {
      // Reporter can only update: title, description, category, priority, photoUrl
      const allowedFields = ['title', 'description', 'category', 'priority', 'photoUrl'];
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });
      updateData = filteredData;
      
      // Reporter cannot change status to anything other than 'reported' Only admin can change status
      delete updateData.status;
      delete updateData.resolutionNotes;
    }

    // Handle photo upload
    if (file) {
      if (file.path) {
        updateData.photoUrl = `/uploads/reports/${file.filename}`;
      } else if (file.secure_url) {
        updateData.photoUrl = file.secure_url;
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePhoto: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return updatedReport;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update report", 500);
  }
};

// Delete report (Reporter can delete their own, Admin can delete any)
export const deleteReportService = async (userId, userRole, reportId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        id: reportId,
        condoId: user.condoId,
        deletedAt: null
      },
      include: {
        responses: true
      }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    const isAdmin = ['condo_admin', 'super_admin'].includes(userRole);
    const isReporter = existingReport.reporterId === userId;

    if (!isAdmin && !isReporter) {
      throw new AppError("You are not authorized to delete this report", 403);
    }

    // Delete all responses first
    if (existingReport.responses.length > 0) {
      await prisma.reportResponse.deleteMany({
        where: { reportId: reportId }
      });
    }

    // Soft delete the report
    const deletedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        deletedAt: new Date()
      }
    });

    return { message: "Report deleted successfully", id: reportId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete report", 500);
  }
};

// Add response to a report (Admin or Reporter)
export const addReportResponseService = async (userId, reportId, data) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        condoId: true, 
        role: true,
        fullName: true
      }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        id: reportId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    // Check authorization: Admin or Reporter can respond
    const isAdmin = ['condo_admin', 'super_admin'].includes(user.role);
    const isReporter = existingReport.reporterId === userId;

    if (!isAdmin && !isReporter) {
      throw new AppError("You are not authorized to respond to this report", 403);
    }

    const { message, isAdminResponse } = data;

    // If reporter responds, isAdminResponse should be false If admin responds, isAdminResponse should be true
    const finalIsAdmin = isAdmin ? true : false;

    const newResponse = await prisma.reportResponse.create({
      data: {
        reportId,
        userId,
        message,
        isAdminResponse: finalIsAdmin
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        }
      }
    });

    return newResponse;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to add response", 500);
  }
};

// Assign report to someone (Admin only)
export const assignReportService = async (userId, userRole, reportId, data) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can assign reports", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        id: reportId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    const { assignedToId } = data;

    // Verify the assigned user exists and is in the same condo
    const assignedUser = await prisma.user.findFirst({
      where: {
        id: assignedToId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!assignedUser) {
      throw new AppError("User not found or not in this condo", 404);
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        assignedToId,
        status: 'assigned',
        updatedAt: new Date()
      },
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        }
      }
    });

    return updatedReport;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to assign report", 500);
  }
};

// Update report status (Admin only)
export const updateReportStatusService = async (userId, userRole, reportId, data) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can update report status", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingReport = await prisma.report.findFirst({
      where: {
        id: reportId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    const { status, resolutionNotes } = data;

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (status === 'resolved') {
      updateData.resolvedAt = new Date();
    }

    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: updateData,
      include: {
        reporter: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        }
      }
    });

    return updatedReport;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update report status", 500);
  }
};