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
        isMember: !!myMembership,
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
