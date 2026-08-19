// services/announcement.service.js
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";

//Get all announcements for a condo with filters
 
export const getAllAnnouncementsService = async (userId, filters = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    // Super admins can see all announcements, but need to specify condoId
    let condoId = user?.condoId;
    
    // If super admin and no condoId, they need to specify which condo
    if (user?.role === 'super_admin' && !condoId) {
      if (filters.condoId) {
        condoId = filters.condoId;
      } else {
        throw new AppError("Please specify a condo ID to view announcements", 400);
      }
    }

    if (!condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const { 
      announcementType, 
      isPinned, 
      search, 
      page = 1, 
      limit = 20 
    } = filters;
    const skip = (page - 1) * limit;

    const where = {
      condoId: condoId,
      deletedAt: null,
      OR: [
        { expiryDate: null },
        { expiryDate: { gt: new Date() } }
      ]
    };

    if (announcementType) where.announcementType = announcementType;
    if (isPinned !== undefined) where.isPinned = isPinned;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          createdBy: {
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
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.announcement.count({ where })
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
    throw new AppError("Failed to fetch announcements", 500);
  }
};

 // Get single announcement by ID
 
export const getAnnouncementByIdService = async (userId, announcementId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    let condoId = user?.condoId;

    const announcement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        deletedAt: null,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: new Date() } }
        ]
      },
      include: {
        createdBy: {
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
        }
      }
    });

    if (!announcement) {
      throw new AppError("Announcement not found", 404);
    }

    // Check if user has access to this announcement
    if (user?.role === 'super_admin') {
      // Super admin can access any announcement
      return announcement;
    }

    // Regular users can only see announcements in their condo
    if (announcement.condoId !== condoId) {
      throw new AppError("You don't have access to this announcement", 403);
    }

    return announcement;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch announcement", 500);
  }
};
 // Create a new announcement (Admin/Super Admin only)
 
export const createAnnouncementService = async (userId, data, file = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        condoId: true,
        fullName: true,
        role: true
      }
    });

    // Check if user is admin or super_admin
    if (!['condo_admin', 'super_admin'].includes(user?.role)) {
      throw new AppError("Only admins can create announcements", 403);
    }

    const { 
      title, 
      body, 
      announcementType, 
      expiryDate, 
      isPinned, 
      imageUrl,
      condoId // Allow super admin to specify condoId
    } = data;

    let targetCondoId = condoId || user?.condoId;

    // Super admin must specify condoId
    if (user?.role === 'super_admin' && !targetCondoId) {
      throw new AppError("Super admin must specify a condo ID for the announcement", 400);
    }

    // Regular admin must be associated with a condo
    if (user?.role === 'condo_admin' && !targetCondoId) {
      throw new AppError("Admin not associated with any condo", 400);
    }

    // Verify the condo exists
    const condo = await prisma.condo.findUnique({
      where: { id: targetCondoId }
    });

    if (!condo) {
      throw new AppError("Condo not found", 404);
    }

    // Handle image upload if provided
    let finalImageUrl = imageUrl || null;
    if (file) {
      finalImageUrl = file.path || file.secure_url;
    }

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        body,
        announcementType,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isPinned: isPinned || false,
        imageUrl: finalImageUrl,
        createdById: user.id,
        createdByRole: user.role === 'super_admin' ? 'super_admin' : 'admin',
        condoId: targetCondoId
        // isPublic removed - all announcements visible to condo members
      },
      include: {
        createdBy: {
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
        }
      }
    });

    return newAnnouncement;
  } catch (error) {
    console.error('Create announcement error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create announcement", 500);
  }
};
// Update an announcement (Admin/Super Admin only)
 
export const updateAnnouncementService = async (userId, userRole, announcementId, data, file = null) => {
  try {
    // Check if user is admin or super_admin
    if (!['condo_admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can update announcements", 403);
    }

    const existingAnnouncement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        deletedAt: null
      }
    });

    if (!existingAnnouncement) {
      throw new AppError("Announcement not found", 404);
    }

    // If user is condo_admin, they can only update their own condo's announcements
    if (userRole === 'condo_admin') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { condoId: true }
      });

      if (existingAnnouncement.condoId !== user?.condoId) {
        throw new AppError("You can only update announcements in your condo", 403);
      }
    }

    // Handle image upload if provided
    let updateData = { ...data };
    if (file) {
      updateData.imageUrl = file.path || file.secure_url;
    }

    // Handle expiry date
    if (data.expiryDate) {
      updateData.expiryDate = new Date(data.expiryDate);
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
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
        }
      }
    });

    return updatedAnnouncement;
  } catch (error) {
    console.error('Update announcement error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update announcement", 500);
  }
};
// Delete an announcement (Admin/Super Admin only)
 
export const deleteAnnouncementService = async (userId, userRole, announcementId) => {
  try {
    // Check if user is admin or super_admin
    if (!['condo_admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can delete announcements", 403);
    }

    const existingAnnouncement = await prisma.announcement.findFirst({
      where: {
        id: announcementId,
        deletedAt: null
      }
    });

    if (!existingAnnouncement) {
      throw new AppError("Announcement not found", 404);
    }

    // If user is condo_admin, they can only delete their own condo's announcements
    if (userRole === 'condo_admin') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { condoId: true }
      });

      if (existingAnnouncement.condoId !== user?.condoId) {
        throw new AppError("You can only delete announcements in your condo", 403);
      }
    }

    // Soft delete
    const deletedAnnouncement = await prisma.announcement.update({
      where: { id: announcementId },
      data: {
        deletedAt: new Date()
      }
    });

    return { message: "Announcement deleted successfully", id: announcementId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete announcement", 500);
  }
};

// Get pinned announcements
 
export const getPinnedAnnouncementsService = async (userId, condoId = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true, role: true }
    });

    let targetCondoId = condoId || user?.condoId;

    // Super admin must specify condoId
    if (user?.role === 'super_admin' && !targetCondoId) {
      throw new AppError("Please specify a condo ID to view pinned announcements", 400);
    }

    if (!targetCondoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const announcements = await prisma.announcement.findMany({
      where: {
        condoId: targetCondoId,
        isPinned: true,
        deletedAt: null,
        OR: [
          { expiryDate: null },
          { expiryDate: { gt: new Date() } }
        ]
      },
      include: {
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return announcements;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch pinned announcements", 500);
  }
};

 //Get all condos (for super admin to select)
 
export const getAllCondosService = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    // Only super admin can view all condos
    if (user?.role !== 'super_admin') {
      throw new AppError("Only super admin can view all condos", 403);
    }

    const condos = await prisma.condo.findMany({
      where: {
        deletedAt: null,
        activeStatus: true
      },
      select: {
        id: true,
        condoName: true,
        condoCode: true,
        address: true,
        city: true
      },
      orderBy: {
        condoName: 'asc'
      }
    });

    return condos;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch condos", 500);
  }
};