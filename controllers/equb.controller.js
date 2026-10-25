import asyncHandler from "../utils/asyncHandler.js";

import {
  createEqubService,
  getAllEqubsService,
  getEqubByIdService,
  getPublicEqubsService,
  getPublicEqubByIdService,
  searchEqubsService,
  updateEqubService,
  deleteEqubService
} from "../services/equb.service.js";

import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/appError.js";
// CREATE
// POST /api/condos/:condoId/equbs

export const createEqubController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equb =
      await createEqubService(
        condoId,
        req.user,
        req.body
      );


    res.status(201).json({

      success: true,

      message:
        "Equb created successfully",

      data: equb,

    });

  });


// ADMIN GET ALL

export const getAllEqubsController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equbs =
      await getAllEqubsService(

        condoId,

        req.user,

        {
          status:
            req.query.status,

          name:
            req.query.name,
        }

      );


    res.status(200).json({

      success: true,

      count:
        equbs.length,

      data:
        equbs,

    });

});

// SEARCH EQUbs

export const searchEqubsController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equbs =
      await searchEqubsService(

        condoId,

        req.query.search,

        req.user

      );


    res.status(200).json({

      success: true,

      count:
        equbs.length,

      data:
        equbs,

    });
});

// ADMIN GET ONE

export const getEqubByIdController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id
    } = req.params;


    const equb =
      await getEqubByIdService(

        condoId,

        id,

        req.user

      );


    res.status(200).json({

      success: true,

      data:
        equb,

    });

  });

// PUBLIC / USER GET ALL

export const getPublicEqubsController =
  asyncHandler(async (req, res) => {

    const {
      condoId
    } = req.params;


    const equbs =
      await getPublicEqubsService(
        condoId
      );


    res.status(200).json({

      success: true,

      count: equbs.length,

      data: equbs,

    });

  });


// PUBLIC GET ONE

export const getPublicEqubByIdController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id
    } = req.params;


    const equb =
      await getPublicEqubByIdService(

        condoId,

        id

      );


    res.status(200).json({

      success: true,

      data: equb,

    });

  });


// UPDATE

export const updateEqubController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id
    } = req.params;


    const equb =
      await updateEqubService(

        condoId,

        id,

        req.body,

        req.user

      );


    res.status(200).json({

      success: true,

      message:
        "Equb updated successfully",

      data: equb,

    });

  });

  //delete equb
  export const deleteEqubController =
  asyncHandler(async (req, res) => {

    const {
      condoId,
      id,
    } = req.params;

    const result =
      await deleteEqubService(
        condoId,
        id,
        req.user
      );

    res.status(200).json({

      success: true,

      message:
        "Equb deleted successfully",

      data:
        result,

    });

  });
// RESIDENT PORTAL: GET MY EQUBS
export const getMyEqubsController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const condoId = req.user.condoId;

  const equbs = await prisma.equb.findMany({
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
      payouts: {
        include: {
          winner: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enrichedEqubs = await Promise.all(
    equbs.map(async (eq) => {
      const myMembership = eq.members.find((m) => m.userId === userId);

      const verifiedPayments = await prisma.payment.findMany({
        where: {
          userId,
          equbId: eq.id,
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
          equbId: eq.id,
          status: "pending",
        },
      });

      const myPayout = eq.payouts.find((p) => p.winnerId === userId);

      return {
        ...eq,
        isMember: myMembership ? myMembership.status === "active" : false,
        membershipStatus: myMembership ? myMembership.status : "not_member",
        myMembership: myMembership || null,
        myVerifiedContribution: totalVerifiedContribution,
        myPendingPaymentsCount: pendingPayments,
        verifiedPayments,
        myPayout: myPayout || null,
        isWinner: myMembership ? myMembership.hasReceivedPayout : false,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: enrichedEqubs,
  });
});

// RESIDENT PORTAL: GET MY EQUB BY ID
export const getMyEqubByIdController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const equb = await prisma.equb.findFirst({
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
      payouts: {
        include: {
          winner: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { roundNumber: "asc" },
      },
    },
  });

  if (!equb) {
    throw new AppError("Equb not found", 404);
  }

  const myMembership = equb.members.find((m) => m.userId === userId);
  const verifiedPayments = await prisma.payment.findMany({
    where: {
      userId,
      equbId: equb.id,
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
      equbId: equb.id,
      status: "pending",
    },
    orderBy: { createdAt: "desc" },
  });

  const myPayout = equb.payouts.find((p) => p.winnerId === userId);

  res.status(200).json({
    success: true,
    data: {
      ...equb,
      isMember: !!myMembership,
      myMembership: myMembership || null,
      myVerifiedContribution: totalVerifiedContribution,
      verifiedPayments,
      pendingPayments,
      myPayout: myPayout || null,
      isWinner: myMembership ? myMembership.hasReceivedPayout : false,
    },
  });
});

// RESIDENT PORTAL: REQUEST TO JOIN EQUB
export const requestJoinEqubController = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const condoId = req.user.condoId;
  const { id: equbId } = req.params;

  if (!condoId) {
    throw new AppError("You must be assigned to an active condominium to join an Equb", 400);
  }

  const equb = await prisma.equb.findFirst({
    where: {
      id: equbId,
      condoId,
      deletedAt: null,
    },
  });

  if (!equb) {
    throw new AppError("Equb not found in your condominium", 404);
  }

  const existingMember = await prisma.equbMember.findUnique({
    where: {
      equbId_userId: {
        equbId,
        userId,
      },
    },
  });

  if (existingMember) {
    if (existingMember.status === "active") {
      throw new AppError("You are already an active member of this Equb", 400);
    }
    if (existingMember.status === "pending") {
      throw new AppError("Your membership request is already pending administrator review", 400);
    }
    const updated = await prisma.equbMember.update({
      where: { id: existingMember.id },
      data: {
        status: "pending",
        joinedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Equb membership request submitted for administrator review",
      data: updated,
    });
  }

  const newMember = await prisma.equbMember.create({
    data: {
      equbId,
      userId,
      condoId,
      status: "pending",
    },
  });

  return res.status(201).json({
    success: true,
    message: "Equb membership request submitted for administrator review",
    data: newMember,
  });
});
