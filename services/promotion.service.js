// services/promotion.service.js
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";

// Get all promotions (Public - anyone can view)
export const getAllPromotionsService = async (filters = {}) => {
  try {
    const { type, category, status = 'active', search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      isActive: true
    };

    if (status === 'active') {
      where.status = 'active';
      where.expiresAt = { gt: new Date() };
    } else if (status === 'all') {
      // Admin can see all
    } else {
      where.status = status;
    }

    if (type) where.type = type;
    if (category) where.category = category;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.promotion.findMany({
        where,
        include: {
          postedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              profilePhoto: true
            }
          },
          condo: {
            select: {
              id: true,
              condoName: true,
              condoCode: true
            }
          },
          reviewedBy: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.promotion.count({ where })
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
    throw new AppError("Failed to fetch promotions", 500);
  }
};

// Get single promotion by ID (Public)
export const getPromotionByIdService = async (promotionId) => {
  try {
    const promotion = await prisma.promotion.findFirst({
      where: {
        id: promotionId,
        deletedAt: null,
       
      },
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        },
        condo: {
          select: {
            id: true,
            condoName: true,
            condoCode: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }

    await prisma.promotion.update({
      where: { id: promotionId },
      data: { views: { increment: 1 } }
    });

    return promotion;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to fetch promotion", 500);
  }
};

// Create a new promotion (Admin/Super Admin only)
export const createPromotionService = async (userId, data, files = null) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, role: true }
    });

    if (!['condo_admin', 'super_admin'].includes(user?.role)) {
      throw new AppError("Only admins can create promotions", 403);
    }

    const { 
      title, description, type, category, price, businessName, contactPerson,
      contactNumber, email, websiteUrl, expiresAt, condoId
    } = data;

    let imageUrl = null;
    let additionalImages = [];

    if (files) {
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        if (file.path) {
          imageUrl = `/uploads/promotions/${file.filename}`;
        } else if (file.secure_url) {
          imageUrl = file.secure_url;
        }
      }
      
      if (files.additionalImages) {
        const filesArray = Array.isArray(files.additionalImages) ? files.additionalImages : [files.additionalImages];
        for (const file of filesArray) {
          if (file.path) {
            additionalImages.push(`/uploads/promotions/additional/${file.filename}`);
          } else if (file.secure_url) {
            additionalImages.push(file.secure_url);
          }
        }
      }
    }

    let targetCondoId = condoId || null;
    if (targetCondoId) {
      const condo = await prisma.condo.findUnique({
        where: { id: targetCondoId }
      });
      if (!condo) {
        throw new AppError("Condo not found", 404);
      }
    }

    const newPromotion = await prisma.promotion.create({
      data: {
        title,
        description,
        type,
        category: category || null,
        price: parseFloat(price),
        currency: 'ETB',
        businessName,
        contactPerson: contactPerson || null,
        contactNumber,
        email: email || null,
        websiteUrl: websiteUrl || null,
        imageUrl,
        additionalImages,
        expiresAt: new Date(expiresAt),
        status: 'pending',
        isActive: true,
        postedById: user.id,
        postedByRole: user.role === 'super_admin' ? 'super_admin' : 'admin',
        condoId: targetCondoId
      },
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
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

    return newPromotion;
  } catch (error) {
    console.error('Create promotion error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to create promotion", 500);
  }
};

// Review/Approve a promotion (Admin/Super Admin only)
export const reviewPromotionService = async (userId, userRole, promotionId, data) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can review promotions", 403);
    }

    const existingPromotion = await prisma.promotion.findFirst({
      where: { id: promotionId, deletedAt: null }
    });

    if (!existingPromotion) {
      throw new AppError("Promotion not found", 404);
    }

    if (existingPromotion.status !== 'pending') {
      throw new AppError("This promotion has already been reviewed", 400);
    }

    const { status, rejectionReason } = data;

    const updateData = {
      status: status,
      reviewedById: userId,
      reviewedAt: new Date(),
      isActive: status === 'approved'
    };

    if (status === 'approved') {
      updateData.publishedAt = new Date();
    } else if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason || null;
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: updateData,
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
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

    return updatedPromotion;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to review promotion", 500);
  }
};

// Update a promotion (Admin/Super Admin only)
export const updatePromotionService = async (userId, userRole, promotionId, data, files = null) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can update promotions", 403);
    }

    const existingPromotion = await prisma.promotion.findFirst({
      where: { id: promotionId, deletedAt: null }
    });

    if (!existingPromotion) {
      throw new AppError("Promotion not found", 404);
    }

    let updateData = { ...data };
    
    if (data.expiresAt) {
      updateData.expiresAt = new Date(data.expiresAt);
    }

    if (data.status === 'cancelled') {
      updateData.isActive = false;
    }

    if (files) {
      if (files.image) {
        const file = Array.isArray(files.image) ? files.image[0] : files.image;
        if (file.path) {
          updateData.imageUrl = `/uploads/promotions/${file.filename}`;
        } else if (file.secure_url) {
          updateData.imageUrl = file.secure_url;
        }
      }
      
      if (files.additionalImages) {
        const filesArray = Array.isArray(files.additionalImages) ? files.additionalImages : [files.additionalImages];
        const newImages = [];
        for (const file of filesArray) {
          if (file.path) {
            newImages.push(`/uploads/promotions/additional/${file.filename}`);
          } else if (file.secure_url) {
            newImages.push(file.secure_url);
          }
        }
        updateData.additionalImages = newImages;
      }
    }

    const updatedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: {
        postedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePhoto: true
          }
        },
        reviewedBy: {
          select: {
            id: true,
            fullName: true,
            email: true
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

    return updatedPromotion;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to update promotion", 500);
  }
};

// Delete a promotion (Admin/Super Admin only)
export const deletePromotionService = async (userId, userRole, promotionId) => {
  try {
    if (!['condo_admin', 'super_admin'].includes(userRole)) {
      throw new AppError("Only admins can delete promotions", 403);
    }

    const existingPromotion = await prisma.promotion.findFirst({
      where: { id: promotionId, deletedAt: null }
    });

    if (!existingPromotion) {
      throw new AppError("Promotion not found", 404);
    }

    const deletedPromotion = await prisma.promotion.update({
      where: { id: promotionId },
      data: {
        deletedAt: new Date(),
        isActive: false
      }
    });

    return { message: "Promotion deleted successfully", id: promotionId };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to delete promotion", 500);
  }
};

// Track promotion click
export const trackPromotionClickService = async (promotionId) => {
  try {
    const promotion = await prisma.promotion.findFirst({
      where: {
        id: promotionId,
        deletedAt: null,
        isActive: true
      }
    });

    if (!promotion) {
      throw new AppError("Promotion not found", 404);
    }

    await prisma.promotion.update({
      where: { id: promotionId },
      data: { clicks: { increment: 1 } }
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Failed to track click", 500);
  }
};