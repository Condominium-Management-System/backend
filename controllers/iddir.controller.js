import {
  createIddirService,
  getPublicIddirsService,
  getPublicIddirByIdService,
  getIddirsService,
  getIddirByIdService,
  searchIddirsService,
  updateIddirService,
  deleteIddirService,
} from "../services/iddir.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/appError.js";

// Create Iddir
export const createIddirController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await createIddirService(
        req.params.condoId,
        req.body,
        req.user
      );

    res.status(201).json({
      success: true,
      message: "Iddir created successfully",
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};

// Get public Iddirs
export const getPublicIddirsController = async (
  req,
  res,
  next
) => {
  try {
    const iddirs =
      await getPublicIddirsService(
        req.query
      );

    res.status(200).json({
      success: true,
      count: iddirs.length,
      data: iddirs,
    });
  } catch (error) {
    next(error);
  }
};

// Get public Iddir by id
export const getPublicIddirByIdController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const iddir =
        await getPublicIddirByIdService(
          req.params.id
        );

      res.status(200).json({
        success: true,
        data: iddir,
      });
    } catch (error) {
      next(error);
    }
  };

// Get admin Iddirs
export const getIddirsController = async (
  req,
  res,
  next
) => {
  try {
    const iddirs =
      await getIddirsService({
        condoId:
          req.params.condoId || null,
        requester: req.user,
        query: req.query,
      });

    res.status(200).json({
      success: true,
      count: iddirs.length,
      data: iddirs,
    });
  } catch (error) {
    next(error);
  }
};

// Search admin Iddirs
export const searchIddirsController = async (
  req,
  res,
  next
) => {
  try {
    const iddirs =
      await searchIddirsService({
        condoId:
          req.params.condoId || null,
        requester: req.user,
        search:
          req.query.search,
        status:
          req.query.status,
      });

    res.status(200).json({
      success: true,
      count: iddirs.length,
      data: iddirs,
    });
  } catch (error) {
    next(error);
  }
};

// Get admin Iddir by id
export const getIddirByIdController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await getIddirByIdService(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};

// Update Iddir
export const updateIddirController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await updateIddirService(
        req.params.condoId,
        req.params.id,
        req.body,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Iddir updated successfully",
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Iddir
export const deleteIddirController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await deleteIddirService(
        req.params.condoId,
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Iddir deleted successfully",
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};
// RESIDENT PORTAL: GET MY IDDIRS
export const getMyIddirsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const condoId = req.user.condoId;

  const iddirs = await prisma.iddir.findMany({
    where: {
      ...(condoId ? { condoId } : {}),
      deletedAt: null,
    },
    include: {
      condo: {
        select: { id: true, condoName: true, condoCode: true },
      },
      members: {
        where: { status: { not: "inactive" } },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, block: true, roomNo: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enrichedIddirs = await Promise.all(
    iddirs.map(async (idr) => {
      const myMembership = idr.members.find((m) => m.userId === userId);

      const verifiedPayments = await prisma.payment.findMany({
        where: {
          userId,
          iddirId: idr.id,
          status: "approved",
        },
        select: {
          id: true,
          amount: true,
          monthYear: true,
          paymentDate: true,
          approvalDate: true,
          paymentMethod: true,
        },
      });

      const totalVerifiedContribution = verifiedPayments.reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      const pendingPayments = await prisma.payment.count({
        where: {
          userId,
          iddirId: idr.id,
          status: "pending",
        },
      });

      const disbursements = await prisma.transaction.findMany({
        where: {
          condoId: idr.condoId,
          paymentType: "iddir",
          status: "completed",
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      return {
        ...idr,
        isMember: myMembership ? myMembership.status === "active" : false,
        membershipStatus: myMembership ? myMembership.status : "not_member",
        myMembership: myMembership || null,
        myVerifiedContribution: totalVerifiedContribution,
        myPendingPaymentsCount: pendingPayments,
        verifiedPayments,
        disbursements,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: enrichedIddirs,
  });
});

// RESIDENT PORTAL: GET MY IDDIR BY ID
export const getMyIddirByIdController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const iddir = await prisma.iddir.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      condo: {
        select: { id: true, condoName: true, condoCode: true },
      },
      members: {
        where: { status: { not: "inactive" } },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, block: true, roomNo: true },
          },
        },
      },
    },
  });

  if (!iddir) {
    throw new AppError("Iddir not found", 404);
  }

  const myMembership = iddir.members.find((m) => m.userId === userId);
  const verifiedPayments = await prisma.payment.findMany({
    where: {
      userId,
      iddirId: iddir.id,
      status: "approved",
    },
    orderBy: { createdAt: "desc" },
  });

  const totalVerifiedContribution = verifiedPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const pendingPayments = await prisma.payment.findMany({
    where: {
      userId,
      iddirId: iddir.id,
      status: "pending",
    },
    orderBy: { createdAt: "desc" },
  });

  const disbursements = await prisma.transaction.findMany({
    where: {
      condoId: iddir.condoId,
      paymentType: "iddir",
      status: "completed",
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  res.status(200).json({
    success: true,
    data: {
      ...iddir,
      isMember: !!myMembership,
      myMembership: myMembership || null,
      myVerifiedContribution: totalVerifiedContribution,
      verifiedPayments,
      pendingPayments,
      disbursements,
    },
  });
});

// RESIDENT PORTAL: REQUEST TO JOIN IDDIR
export const requestJoinIddirController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const condoId = req.user.condoId;
  const { id: iddirId } = req.params;

  if (!condoId) {
    throw new AppError("You must be assigned to an active condominium to join an Iddir", 400);
  }

  const iddir = await prisma.iddir.findFirst({
    where: {
      id: iddirId,
      condoId,
      deletedAt: null,
    },
  });

  if (!iddir) {
    throw new AppError("Iddir not found in your condominium", 404);
  }

  const existingMember = await prisma.iddirMember.findUnique({
    where: {
      iddirId_userId: {
        iddirId,
        userId,
      },
    },
  });

  if (existingMember) {
    if (existingMember.status === "active") {
      throw new AppError("You are already an active member of this Iddir", 400);
    }
    if (existingMember.status === "pending") {
      throw new AppError("Your membership request is already pending administrator review", 400);
    }
    const updated = await prisma.iddirMember.update({
      where: { id: existingMember.id },
      data: {
        status: "pending",
        joinedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Iddir membership request submitted for administrator review",
      data: updated,
    });
  }

  const newMember = await prisma.iddirMember.create({
    data: {
      iddirId,
      userId,
      status: "pending",
    },
  });

  return res.status(201).json({
    success: true,
    message: "Iddir membership request submitted for administrator review",
    data: newMember,
  });
});

// RESIDENT PORTAL: SUBMIT IDDIR ASSISTANCE CLAIM
export const submitIddirClaimController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const condoId = req.user.condoId;
  const { id: iddirId } = req.params;
  const { claimType, reason, description, amountRequested, documentUrl } = req.body;

  if (!claimType || !reason || !amountRequested) {
    throw new AppError("Claim type, reason, and amount requested are required", 400);
  }

  const parsedAmount = parseFloat(amountRequested);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new AppError("Please provide a valid requested amount greater than 0", 400);
  }

  const iddir = await prisma.iddir.findFirst({
    where: {
      id: iddirId,
      condoId,
      deletedAt: null,
    },
  });

  if (!iddir) {
    throw new AppError("Active Iddir not found in your condominium", 404);
  }

  const member = await prisma.iddirMember.findUnique({
    where: {
      iddirId_userId: {
        iddirId,
        userId,
      },
    },
  });

  if (!member || member.status !== "active") {
    throw new AppError("Only active, approved members of this Iddir are eligible to request assistance", 403);
  }

  const pendingClaim = await prisma.iddirClaim.findFirst({
    where: {
      iddirId,
      userId,
      status: { in: ["submitted", "under_review"] },
    },
  });

  if (pendingClaim) {
    throw new AppError("You already have an assistance claim under review for this Iddir", 409);
  }

  const claim = await prisma.iddirClaim.create({
    data: {
      iddirId,
      userId,
      claimType: claimType.trim(),
      reason: reason.trim(),
      description: description ? description.trim() : null,
      amountRequested: parsedAmount,
      documentUrl: documentUrl || null,
      status: "submitted",
    },
    include: {
      iddir: {
        select: { id: true, name: true, contributionAmount: true },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: "Assistance claim submitted successfully for committee review",
    data: claim,
  });
});

// RESIDENT PORTAL: GET MY CLAIMS
export const getMyIddirClaimsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const claims = await prisma.iddirClaim.findMany({
    where: {
      userId,
    },
    include: {
      iddir: {
        select: { id: true, name: true, contributionAmount: true },
      },
      reviewedBy: {
        select: { id: true, fullName: true },
      },
      transaction: {
        select: { id: true, referenceNo: true, status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    data: claims,
  });
});

// RESIDENT PORTAL: GET CLAIM BY ID
export const getIddirClaimByIdController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const claim = await prisma.iddirClaim.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      iddir: {
        select: { id: true, name: true, contributionAmount: true },
      },
      reviewedBy: {
        select: { id: true, fullName: true },
      },
      transaction: {
        select: { id: true, referenceNo: true, status: true, createdAt: true },
      },
    },
  });

  if (!claim) {
    throw new AppError("Assistance claim not found", 404);
  }

  res.status(200).json({
    success: true,
    data: claim,
  });
});

// ADMIN: REVIEW CLAIM
export const reviewIddirClaimController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, amountApproved } = req.body;

  if (!["under_review", "approved", "rejected"].includes(status)) {
    throw new AppError("Status must be under_review, approved, or rejected", 400);
  }

  const claim = await prisma.iddirClaim.findUnique({
    where: { id },
  });

  if (!claim) {
    throw new AppError("Claim not found", 404);
  }

  const updated = await prisma.iddirClaim.update({
    where: { id },
    data: {
      status,
      adminNotes: adminNotes || claim.adminNotes,
      amountApproved: amountApproved !== undefined ? parseFloat(amountApproved) : (status === "approved" ? claim.amountRequested : null),
      reviewedById: req.user.id,
      decidedAt: status === "approved" || status === "rejected" ? new Date() : claim.decidedAt,
    },
    include: {
      iddir: true,
      user: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  res.status(200).json({
    success: true,
    message: `Claim status updated to ${status}`,
    data: updated,
  });
});
