// services/lostFound.service.js
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";
import cloudinary from "../config/cloudinary.config.js";


const deleteFromCloudinary = async (photoUrl) => {
  if (!photoUrl) return;
  
  try {
    // Extract public ID from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename
    const urlParts = photoUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = `lost-found/${filename.split('.')[0]}`;
    
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary delete result:`, result);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    
  }
};
// get all lost/found items for a condo with pagination and filtering
export const getAllLostFoundService = async (userId, filters = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const { type, category, status, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      condoId: user.condoId,
      deletedAt: null
    };

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.lostFound.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              profilePhoto: true
            }
          },
          claimedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true
            }
          },
          verifiedBy: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.lostFound.count({ where })
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
    throw new AppError("Failed to fetch lost/found items", 500);
  }
};

// get single lost/found item by ID
export const getLostFoundByIdService = async (userId, itemId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const item = await prisma.lostFound.findFirst({
      where: {
        id: itemId,
        condoId: user.condoId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            profilePhoto: true
          }
        },
        claimedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        verifiedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!item) {
      throw new AppError("Lost/found item not found", 404);
    }

    return item;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch lost/found item", 500);
  }
};

// create a new lost/found item with optional Cloudinary photo upload
export const createLostFoundService = async (userId, data, file = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true,
        condoId: true,
        fullName: true 
      }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const { 
      type, 
      itemName, 
      description, 
      category, 
      location, 
      dateLostFound 
    } = data;

    // Handle date properly
    let parsedDate;
    try {
      if (dateLostFound && typeof dateLostFound === 'string') {
        parsedDate = new Date(dateLostFound);
      } else if (dateLostFound instanceof Date) {
        parsedDate = dateLostFound;
      } else {
        parsedDate = new Date();
      }

      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      throw new AppError('Invalid date format. Please use YYYY-MM-DD format', 400);
    }

    // Handle photo upload - Cloudinary URL
    let photoUrl = null;
    if (file) {
      // Cloudinary returns the URL in path or secure_url
      photoUrl = file.path || file.secure_url;
      console.log('Photo uploaded to Cloudinary:', photoUrl);
    }

    const newItem = await prisma.lostFound.create({
      data: {
        type,
        itemName,
        description,
        category,
        photoUrl,
        location: location || null,
        dateLostFound: parsedDate,
        userId: user.id,
        condoId: user.condoId,
        status: 'open'
      },
      include: {
        user: {
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

    return newItem;
  } catch (error) {
    console.error('Create lost/found error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create lost/found item", 500);
  }
};

// Update lost/found item with Cloudinary photo upload
export const updateLostFoundService = async (userId, userRole, itemId, data, file = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        condoId: true,
        role: true 
      }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingItem = await prisma.lostFound.findFirst({
      where: {
        id: itemId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!existingItem) {
      throw new AppError("Lost/found item not found", 404);
    }

    // Check authorization: only admin, super_admin, or owner can update
    const isAdmin = ['admin', 'super_admin'].includes(userRole);
    const isOwner = existingItem.userId === userId;

    if (!isAdmin && !isOwner) {
      throw new AppError("You are not authorized to update this item", 403);
    }

    // Prevent non-admins from updating sensitive fields
    if (!isAdmin) {
      const sensitiveFields = ['claimVerified', 'verifiedById', 'status'];
      const hasSensitiveUpdate = sensitiveFields.some(field => data[field] !== undefined);
      if (hasSensitiveUpdate) {
        throw new AppError("Only admins can update verification status", 403);
      }
    }

    // Handle date properly if it's being updated
    let updateData = { ...data };
    if (data.dateLostFound) {
      try {
        let parsedDate;
        if (typeof data.dateLostFound === 'string') {
          parsedDate = new Date(data.dateLostFound);
        } else if (data.dateLostFound instanceof Date) {
          parsedDate = data.dateLostFound;
        }
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          updateData.dateLostFound = parsedDate;
        }
      } catch (error) {
        throw new AppError('Invalid date format. Please use YYYY-MM-DD format', 400);
      }
    }

    // Handle photo upload - Cloudinary
    if (file) {
      // Delete old photo from Cloudinary if it exists
      if (existingItem.photoUrl) {
        await deleteFromCloudinary(existingItem.photoUrl);
      }
      // Save new Cloudinary URL
      updateData.photoUrl = file.path || file.secure_url;
      console.log('Photo updated on Cloudinary:', updateData.photoUrl);
    }

    const updatedItem = await prisma.lostFound.update({
      where: { id: itemId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        claimedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        verifiedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return updatedItem;
  } catch (error) {
    console.error('Update lost/found error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update lost/found item", 500);
  }
};

// Delete lost/found item and its Cloudinary photo

export const deleteLostFoundService = async (userId, userRole, itemId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        condoId: true,
        role: true 
      }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingItem = await prisma.lostFound.findFirst({
      where: {
        id: itemId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!existingItem) {
      throw new AppError("Lost/found item not found", 404);
    }

    const isAdmin = ['admin', 'super_admin'].includes(userRole);
    const isOwner = existingItem.userId === userId;

    if (!isAdmin && !isOwner) {
      throw new AppError("You are not authorized to delete this item", 403);
    }

    // Delete photo from Cloudinary if it exists
    if (existingItem.photoUrl) {
      await deleteFromCloudinary(existingItem.photoUrl);
    }

    // Soft delete the item
    const deletedItem = await prisma.lostFound.update({
      where: { id: itemId },
      data: {
        deletedAt: new Date()
      }
    });

    return { message: "Item deleted successfully", id: itemId };
  } catch (error) {
    console.error('Delete lost/found error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete lost/found item", 500);
  }
};

// claim an item
export const claimItemService = async (userId, itemId, claimData = {}) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        condoId: true,
        fullName: true,
        id: true
      }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingItem = await prisma.lostFound.findFirst({
      where: {
        id: itemId,
        condoId: user.condoId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    });

    if (!existingItem) {
      throw new AppError("Item not found", 404);
    }

    if (existingItem.status !== 'open') {
      throw new AppError("This item is already claimed or archived", 400);
    }

    if (existingItem.userId === userId) {
      throw new AppError("You cannot claim your own lost/found item", 400);
    }

    const updatedItem = await prisma.lostFound.update({
      where: { id: itemId },
      data: {
        claimedById: userId,
        status: 'matched',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        claimedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    });

    return updatedItem;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to claim item", 500);
  }
};

// Verify claim (admin/super_admin only)
export const verifyClaimService = async (userId, userRole, itemId) => {
  try {
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can verify claims", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        condoId: true,
        fullName: true
      }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const existingItem = await prisma.lostFound.findFirst({
      where: {
        id: itemId,
        condoId: user.condoId,
        deletedAt: null
      }
    });

    if (!existingItem) {
      throw new AppError("Item not found", 404);
    }

    if (existingItem.status !== 'matched' || !existingItem.claimedById) {
      throw new AppError("This item has not been claimed yet", 400);
    }

    const verifiedItem = await prisma.lostFound.update({
      where: { id: itemId },
      data: {
        claimVerified: true,
        verifiedById: userId,
        status: 'claimed',
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        claimedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        verifiedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    return verifiedItem;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to verify claim", 500);
  }
};

// Archive old items (admin/super_admin only)
export const archiveOldItemsService = async (userId, userRole, daysOld = 30) => {
  try {
    if (!['admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can archive items", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { condoId: true }
    });

    if (!user || !user.condoId) {
      throw new AppError("User not associated with any condo", 400);
    }

    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - daysOld);

    const archivedItems = await prisma.lostFound.updateMany({
      where: {
        condoId: user.condoId,
        status: 'claimed',
        createdAt: {
          lt: archiveDate
        },
        deletedAt: null
      },
      data: {
        status: 'archived',
        updatedAt: new Date()
      }
    });

    return {
      message: `${archivedItems.count} items archived successfully`,
      count: archivedItems.count
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to archive items", 500);
  }
};