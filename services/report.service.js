// services/report.service.js
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";

// Common inclusion fields for Report queries
const reportInclude = {
  reporter: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profilePhoto: true,
      roomNo: true,
      block: true,
      role: true
    }
  },
  assignedTo: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      profilePhoto: true,
      role: true
    }
  },
  condo: {
    select: {
      id: true,
      condoName: true,
      condoCode: true
    }
  },
  equb: {
    select: {
      id: true,
      name: true,
      contributionAmount: true,
      status: true
    }
  },
  iddir: {
    select: {
      id: true,
      name: true,
      contributionAmount: true,
      status: true
    }
  },
  responses: {
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          profilePhoto: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  }
};

/**
 * Get all reports for the current resident (Reporter sees only their own in their condo)
 */
export const getMyReportsService = async (userId, filters = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user || !user.condoId) {
      if (user?.role === 'super_admin') {
        // Super admin has no single condo; return empty resident reports
        return { items: [], pagination: { total: 0, page: 1, limit: parseInt(limit) || 20, totalPages: 0 } };
      }
      return { items: [], pagination: { total: 0, page: 1, limit: parseInt(limit) || 20, totalPages: 0 } };
    }

    const { status, category, priority, search, page = 1, limit = 20 } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      condoId: user.condoId,
      reporterId: userId,
      deletedAt: null
    };

    if (status && status !== "ALL") where.status = status;
    if (category && category !== "ALL") where.category = category;
    if (priority && priority !== "ALL") where.priority = priority;

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: reportInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.report.count({ where })
    ]);

    return {
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch reports: " + error.message, 500);
  }
};

/**
 * Get all reports for admin
 * - condo_admin: Strictly scoped to their condo
 * - super_admin: System-wide or filtered by condoId
 */
export const getAllReportsForAdminService = async (userId, filters = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!["condo_admin", "super_admin"].includes(user.role)) {
      throw new AppError("Only admins can view all reports", 403);
    }

    const { status, category, priority, search, condoId, page = 1, limit = 50 } = filters;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deletedAt: null
    };

    if (user.role === "condo_admin") {
      if (!user.condoId) {
        throw new AppError("Condo Admin is not associated with any condo", 400);
      }
      where.condoId = user.condoId;
    } else if (user.role === "super_admin") {
      if (condoId && condoId !== "ALL") {
        where.condoId = condoId;
      }
    }

    if (status && status !== "ALL") where.status = status;
    if (category && category !== "ALL") where.category = category;
    if (priority && priority !== "ALL") where.priority = priority;

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
        { reporter: { fullName: { contains: search.trim(), mode: "insensitive" } } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: reportInclude,
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit)
      }),
      prisma.report.count({ where })
    ]);

    return {
      items,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch reports", 500);
  }
};

/**
 * Get single report by ID
 * Residents can only view their own; Admins can view within their scope
 */
export const getReportByIdService = async (userId, reportId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const where = {
      id: reportId,
      deletedAt: null
    };

    if (user.role === "resident") {
      where.reporterId = userId;
      if (user.condoId) where.condoId = user.condoId;
    } else if (user.role === "condo_admin") {
      if (!user.condoId) throw new AppError("Admin not associated with any condo", 400);
      where.condoId = user.condoId;
    }

    const report = await prisma.report.findFirst({
      where,
      include: reportInclude
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

/**
 * Create a new report
 * Residents report issues in their condominium; Admins can also create reports for their condo
 */
export const createReportService = async (userId, data, file = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, condoId: true, fullName: true, role: true }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    let targetCondoId = data.condoId || user.condoId;
    if (!targetCondoId) {
      throw new AppError("Condo ID is required to create a report", 400);
    }

    const { title, description, category, priority, photoUrl, equbId, iddirId } = data;

    if (!title || !description || !category || !priority) {
      throw new AppError("Title, description, category, and priority are required", 400);
    }

    let finalPhotoUrl = photoUrl || null;
    if (file) {
      if (file.path) {
        finalPhotoUrl = file.filename ? `/uploads/reports/${file.filename}` : file.path;
      } else if (file.secure_url) {
        finalPhotoUrl = file.secure_url;
      }
    }

    let finalEqubId = null;
    let finalIddirId = null;

    if (category === 'equb_membership') {
      finalEqubId = equbId || null;
      if (!finalEqubId) {
        throw new AppError("Equb group selection is required for membership request", 400);
      }
      const equb = await prisma.equb.findFirst({
        where: { id: finalEqubId, condoId: targetCondoId, deletedAt: null }
      });
      if (!equb) {
        throw new AppError("The selected Equb group was not found in your condominium", 404);
      }
      const existingMembership = await prisma.equbMember.findUnique({
        where: { equbId_userId: { equbId: finalEqubId, userId: user.id } }
      });
      if (existingMembership && existingMembership.status === 'active') {
        throw new AppError("You are already an active participant in this Equb", 400);
      }
      const pendingReport = await prisma.report.findFirst({
        where: {
          reporterId: user.id,
          equbId: finalEqubId,
          category: 'equb_membership',
          status: { in: ['reported', 'assigned', 'in_progress'] },
          deletedAt: null
        }
      });
      if (pendingReport) {
        throw new AppError("You already have a pending membership request report for this Equb", 400);
      }
      await prisma.equbMember.upsert({
        where: { equbId_userId: { equbId: finalEqubId, userId: user.id } },
        create: { equbId: finalEqubId, userId: user.id, status: 'pending', condoId: targetCondoId },
        update: { status: 'pending', leftAt: null }
      });
    }

    if (category === 'iddir_membership') {
      finalIddirId = iddirId || null;
      if (!finalIddirId) {
        throw new AppError("Iddir group selection is required for membership request", 400);
      }
      const iddir = await prisma.iddir.findFirst({
        where: { id: finalIddirId, condoId: targetCondoId, deletedAt: null }
      });
      if (!iddir) {
        throw new AppError("The selected Iddir group was not found in your condominium", 404);
      }
      const existingMembership = await prisma.iddirMember.findUnique({
        where: { iddirId_userId: { iddirId: finalIddirId, userId: user.id } }
      });
      if (existingMembership && existingMembership.status === 'active') {
        throw new AppError("You are already an active participant in this Iddir", 400);
      }
      const pendingReport = await prisma.report.findFirst({
        where: {
          reporterId: user.id,
          iddirId: finalIddirId,
          category: 'iddir_membership',
          status: { in: ['reported', 'assigned', 'in_progress'] },
          deletedAt: null
        }
      });
      if (pendingReport) {
        throw new AppError("You already have a pending membership request report for this Iddir", 400);
      }
      await prisma.iddirMember.upsert({
        where: { iddirId_userId: { iddirId: finalIddirId, userId: user.id } },
        create: { iddirId: finalIddirId, userId: user.id, status: 'pending' },
        update: { status: 'pending', leftAt: null }
      });
    }

    const newReport = await prisma.report.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        photoUrl: finalPhotoUrl,
        equbId: finalEqubId,
        iddirId: finalIddirId,
        status: "reported",
        reporterId: user.id,
        reporterRole: user.role === "super_admin" ? "super_admin" :
                     user.role === "condo_admin" ? "admin" : "resident",
        condoId: targetCondoId
      },
      include: reportInclude
    });

    return newReport;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || "Failed to create report", 500);
  }
};

/**
 * Update report
 * - Admins can update status, priority, assignment, and resolution notes without overwriting reporter identity
 * - Residents can only edit their own reports while in 'reported' status
 */
export const updateReportService = async (userId, userRole, reportId, data, file = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, condoId: true, role: true }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingReport = await prisma.report.findFirst({
      where: { id: reportId, deletedAt: null }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    const isAdmin = ["condo_admin", "super_admin"].includes(userRole);
    const isReporter = existingReport.reporterId === userId;

    if (userRole === "condo_admin" && existingReport.condoId !== user.condoId) {
      throw new AppError("You can only manage reports in your assigned condominium", 403);
    }

    if (!isAdmin && !isReporter) {
      throw new AppError("You are not authorized to update this report", 403);
    }

    // Business rule: Residents can only edit their own reports while status is 'reported'
    if (!isAdmin && isReporter) {
      if (existingReport.status !== "reported") {
        throw new AppError("You can only edit reports that are in 'reported' status", 400);
      }
    }

    const updateData = { ...data };

    // STRICT IDENTITY INTEGRITY: Never overwrite reporter identity, role, or condoId
    delete updateData.reporterId;
    delete updateData.reporterRole;
    delete updateData.condoId;
    delete updateData.createdAt;

    if (!isAdmin && isReporter) {
      // Residents cannot modify admin-specific fields
      delete updateData.status;
      delete updateData.assignedToId;
      delete updateData.resolutionNotes;
      delete updateData.resolvedAt;
    }

    if (file) {
      if (file.path) {
        updateData.photoUrl = file.filename ? `/uploads/reports/${file.filename}` : file.path;
      } else if (file.secure_url) {
        updateData.photoUrl = file.secure_url;
      }
    }

    if (updateData.status === "resolved" && !existingReport.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: reportInclude
    });

    return updatedReport;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update report", 500);
  }
};

/**
 * Delete / Withdraw report
 * - Admins can soft-delete reports within their scope
 * - Residents can only withdraw/delete their own reports while in 'reported' status
 */
export const deleteReportService = async (userId, userRole, reportId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    const existingReport = await prisma.report.findFirst({
      where: { id: reportId, deletedAt: null }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    const isAdmin = ["condo_admin", "super_admin"].includes(userRole);
    const isReporter = existingReport.reporterId === userId;

    if (userRole === "condo_admin" && existingReport.condoId !== user?.condoId) {
      throw new AppError("You can only manage reports in your condominium", 403);
    }

    if (!isAdmin && !isReporter) {
      throw new AppError("You are not authorized to delete this report", 403);
    }

    // Business rule: Residents can only withdraw their own reports while status is 'reported'
    if (!isAdmin && isReporter) {
      if (existingReport.status !== "reported") {
        throw new AppError("You can only withdraw reports that are in 'reported' status", 400);
      }
    }

    // Soft delete the report
    await prisma.report.update({
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

/**
 * Add response to a report
 * Admins and reporters can add comments / responses
 */
export const addReportResponseService = async (userId, reportId, data) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, condoId: true, role: true, fullName: true }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const existingReport = await prisma.report.findFirst({
      where: { id: reportId, deletedAt: null }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    const isAdmin = ["condo_admin", "super_admin"].includes(user.role);
    const isReporter = existingReport.reporterId === userId;

    if (user.role === "condo_admin" && existingReport.condoId !== user.condoId) {
      throw new AppError("You can only respond to reports in your condominium", 403);
    }

    if (!isAdmin && !isReporter) {
      throw new AppError("You are not authorized to respond to this report", 403);
    }

    const { message } = data;
    if (!message || !message.trim()) {
      throw new AppError("Response message cannot be empty", 400);
    }

    const newResponse = await prisma.reportResponse.create({
      data: {
        reportId,
        userId,
        message: message.trim(),
        isAdminResponse: isAdmin
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true,
            role: true
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

/**
 * Assign report to staff / maintenance / guard (Admin only)
 */
export const assignReportService = async (userId, userRole, reportId, data) => {
  try {
    if (!["condo_admin", "super_admin"].includes(userRole)) {
      throw new AppError("Only admins can assign reports", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    const existingReport = await prisma.report.findFirst({
      where: { id: reportId, deletedAt: null }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    if (userRole === "condo_admin" && existingReport.condoId !== user?.condoId) {
      throw new AppError("You can only assign reports in your condominium", 403);
    }

    const { assignedToId } = data;
    let assignedUser = null;

    if (assignedToId) {
      assignedUser = await prisma.user.findFirst({
        where: {
          id: assignedToId,
          deletedAt: null
        }
      });

      if (!assignedUser) {
        throw new AppError("Assigned user not found", 404);
      }
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        assignedToId: assignedToId || null,
        status: assignedToId ? "assigned" : existingReport.status,
        updatedAt: new Date()
      },
      include: reportInclude
    });

    return updatedReport;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to assign report", 500);
  }
};

/**
 * Update report status and resolution notes (Admin only)
 */
export const updateReportStatusService = async (userId, userRole, reportId, data) => {
  try {
    if (!["condo_admin", "super_admin"].includes(userRole)) {
      throw new AppError("Only admins can update report status", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    const existingReport = await prisma.report.findFirst({
      where: { id: reportId, deletedAt: null }
    });

    if (!existingReport) {
      throw new AppError("Report not found", 404);
    }

    if (userRole === "condo_admin" && existingReport.condoId !== user?.condoId) {
      throw new AppError("You can only update reports in your condominium", 403);
    }

    const { status, resolutionNotes } = data;
    const updateData = { updatedAt: new Date() };

    if (status) {
      updateData.status = status;
      if (['resolved', 'approved'].includes(status) && !existingReport.resolvedAt) {
        updateData.resolvedAt = new Date();
      }

      // Handle Equb membership request approval/rejection
      if (existingReport.category === 'equb_membership' && existingReport.equbId) {
        if (['approved', 'resolved'].includes(status)) {
          const currentMem = await prisma.equbMember.findUnique({
            where: { equbId_userId: { equbId: existingReport.equbId, userId: existingReport.reporterId } }
          });
          const wasActive = currentMem?.status === 'active';

          await prisma.equbMember.upsert({
            where: { equbId_userId: { equbId: existingReport.equbId, userId: existingReport.reporterId } },
            create: { equbId: existingReport.equbId, userId: existingReport.reporterId, status: 'active', condoId: existingReport.condoId },
            update: { status: 'active', leftAt: null }
          });

          if (!wasActive) {
            await prisma.equb.update({
              where: { id: existingReport.equbId },
              data: { noMembers: { increment: 1 } }
            });
          }
        } else if (['rejected', 'closed'].includes(status)) {
          await prisma.equbMember.updateMany({
            where: { equbId: existingReport.equbId, userId: existingReport.reporterId },
            data: { status: 'rejected' }
          });
        }
      }

      // Handle Iddir membership request approval/rejection
      if (existingReport.category === 'iddir_membership' && existingReport.iddirId) {
        if (['approved', 'resolved'].includes(status)) {
          const currentMem = await prisma.iddirMember.findUnique({
            where: { iddirId_userId: { iddirId: existingReport.iddirId, userId: existingReport.reporterId } }
          });
          const wasActive = currentMem?.status === 'active';

          await prisma.iddirMember.upsert({
            where: { iddirId_userId: { iddirId: existingReport.iddirId, userId: existingReport.reporterId } },
            create: { iddirId: existingReport.iddirId, userId: existingReport.reporterId, status: 'active' },
            update: { status: 'active', leftAt: null }
          });

          if (!wasActive) {
            await prisma.iddir.update({
              where: { id: existingReport.iddirId },
              data: { noMembers: { increment: 1 } }
            });
          }
        } else if (['rejected', 'closed'].includes(status)) {
          await prisma.iddirMember.updateMany({
            where: { iddirId: existingReport.iddirId, userId: existingReport.reporterId },
            data: { status: 'rejected' }
          });
        }
      }
    }

    if (resolutionNotes !== undefined) {
      updateData.resolutionNotes = resolutionNotes;
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: updateData,
      include: reportInclude
    });

    return updatedReport;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update report status", 500);
  }
};
