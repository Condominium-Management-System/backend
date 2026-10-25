import AppError from "../errorhandler/AppError.js";

import { prisma } from "../config/prisma.config.js";

import {
  hashPassword,
} from "../utils/password.js";

import {
  adminUserSelect,
} from "../utils/adminUser.js";

import {
  adminCreateUserValidation,
  adminUpdateUserValidation,
  updateRoleValidation,
  verifyUserValidation,
} from "../inputValidation/admin.validation.js";


// HELPER

const isSuperAdmin = (user) => {
  return user?.role === "super_admin";
};


const isCondoAdmin = (user) => {
  return user?.role === "condo_admin";
};


// CHECK ADMIN ACCESS TO USER

const checkUserAccess = async (
  currentUser,
  targetUser
) => {

  if (!targetUser) {
    throw new AppError(
      "User not found",
      404
    );
  }

  if (targetUser.deletedAt) {
    throw new AppError(
      "User has been deleted",
      404
    );
  }


  // Super admin can access everyone

  if (isSuperAdmin(currentUser)) {
    return true;
  }


  // Condo admin can only access
  // users inside own condo

  if (isCondoAdmin(currentUser)) {

    if (
      !currentUser.condoId ||
      currentUser.condoId !== targetUser.condoId
    ) {
      throw new AppError(
        "You can only manage users inside your condominium",
        403
      );
    }

    return true;
  }


  throw new AppError(
    "You do not have permission to manage users",
    403
  );
};


// DASHBOARD STATISTICS

export const getDashboardStatsService =
  async (currentUser) => {

    const isSuper = isSuperAdmin(currentUser);
    const condoFilter =
      isSuper
        ? {}
        : {
          condoId: currentUser.condoId,
        };

    const userCondoFilter =
      isSuper
        ? {}
        : {
          condoId: currentUser.condoId,
        };

    const [
      // Users
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      residents,
      guards,
      condoAdmins,
      superAdmins,
      usersInEqub,
      usersInIddir,

      // Condos
      condos,
      activeCondos,

      // Blocks & Rooms
      blocks,
      rooms,
      occupiedRooms,
      freeRooms,
      reservedRooms,

      // Equbs
      totalEqubs,
      pendingEqubs,
      activeEqubs,
      completedEqubs,
      cancelledEqubs,
      totalEqubMembers,
      totalEqubPayouts,

      // Iddirs
      totalIddirs,
      activeIddirs,
      inactiveIddirs,
      totalIddirMembers,

      // Payments
      totalPayments,
      pendingPayments,
      approvedPayments,
      rejectedPayments,
      approvedPaymentAggregate,
      equbPayments,
      iddirPayments,
      guardFeePayments,
      serviceChargePayments,

      // Transactions
      totalTransactions,
      completedTransactions,
      pendingTransactions,
      failedTransactions,
      reversedTransactions,
      completedTransactionAggregate,

      // Service Fees
      totalServiceFees,
      collectedServiceFees,
      pendingServiceFees,
      collectedServiceFeeAggregate,

      // Reports
      totalReports,
      reportedReports,
      inProgressReports,
      resolvedReports,

      // Lost & Found
      totalLostFound,
      openLostFound,
      claimedLostFound,
    ] = await Promise.all([

      // USERS
      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
        },
      }),

      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
          isVerified: true,
        },
      }),

      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
          isVerified: false,
        },
      }),

      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
          role: "resident",
        },
      }),

      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
          role: "guard",
        },
      }),

      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
          role: "condo_admin",
        },
      }),

      isSuper
        ? prisma.user.count({
          where: {
            deletedAt: null,
            role: "super_admin",
          },
        })
        : Promise.resolve(0),

      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
          isInEqub: true,
        },
      }),

      prisma.user.count({
        where: {
          ...userCondoFilter,
          deletedAt: null,
          isInIddir: true,
        },
      }),

      // CONDOS
      isSuper
        ? prisma.condo.count({
          where: {
            deletedAt: null,
          },
        })
        : Promise.resolve(1),

      isSuper
        ? prisma.condo.count({
          where: {
            deletedAt: null,
            activeStatus: true,
          },
        })
        : Promise.resolve(1),

      // BLOCKS
      prisma.block.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      // ROOMS
      prisma.room.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      prisma.room.count({
        where: {
          ...condoFilter,
          status: "occupied",
          deletedAt: null,
        },
      }),

      prisma.room.count({
        where: {
          ...condoFilter,
          status: "free",
          deletedAt: null,
        },
      }),

      prisma.room.count({
        where: {
          ...condoFilter,
          status: "reserved",
          deletedAt: null,
        },
      }),

      // EQUBS
      prisma.equb.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      prisma.equb.count({
        where: {
          ...condoFilter,
          status: "pending",
          deletedAt: null,
        },
      }),

      prisma.equb.count({
        where: {
          ...condoFilter,
          status: "active",
          deletedAt: null,
        },
      }),

      prisma.equb.count({
        where: {
          ...condoFilter,
          status: "completed",
          deletedAt: null,
        },
      }),

      prisma.equb.count({
        where: {
          ...condoFilter,
          status: "cancelled",
          deletedAt: null,
        },
      }),

      prisma.equbMember.count({
        where: isSuper
          ? {}
          : {
            equb: {
              condoId: currentUser.condoId,
            },
          },
      }),

      prisma.equbPayout.count({
        where: isSuper
          ? {}
          : {
            equb: {
              condoId: currentUser.condoId,
            },
          },
      }),

      // IDDIRS
      prisma.iddir.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      prisma.iddir.count({
        where: {
          ...condoFilter,
          status: "active",
          deletedAt: null,
        },
      }),

      prisma.iddir.count({
        where: {
          ...condoFilter,
          status: "inactive",
          deletedAt: null,
        },
      }),

      prisma.iddirMember.count({
        where: isSuper
          ? {}
          : {
            iddir: {
              condoId: currentUser.condoId,
            },
          },
      }),

      // PAYMENTS
      prisma.payment.count({
        where: condoFilter,
      }),

      prisma.payment.count({
        where: {
          ...condoFilter,
          status: "pending",
        },
      }),

      prisma.payment.count({
        where: {
          ...condoFilter,
          status: "approved",
        },
      }),

      prisma.payment.count({
        where: {
          ...condoFilter,
          status: "rejected",
        },
      }),

      prisma.payment.aggregate({
        where: {
          ...condoFilter,
          status: "approved",
        },
        _sum: {
          totalAmount: true,
        },
      }),

      prisma.payment.count({
        where: {
          ...condoFilter,
          paymentType: "equb",
        },
      }),

      prisma.payment.count({
        where: {
          ...condoFilter,
          paymentType: "iddir",
        },
      }),

      prisma.payment.count({
        where: {
          ...condoFilter,
          paymentType: "guard_fee",
        },
      }),

      prisma.payment.count({
        where: {
          ...condoFilter,
          paymentType: "service_charge",
        },
      }),

      // TRANSACTIONS
      prisma.transaction.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      prisma.transaction.count({
        where: {
          ...condoFilter,
          status: "completed",
          deletedAt: null,
        },
      }),

      prisma.transaction.count({
        where: {
          ...condoFilter,
          status: "pending",
          deletedAt: null,
        },
      }),

      prisma.transaction.count({
        where: {
          ...condoFilter,
          status: "failed",
          deletedAt: null,
        },
      }),

      prisma.transaction.count({
        where: {
          ...condoFilter,
          status: "reversed",
          deletedAt: null,
        },
      }),

      prisma.transaction.aggregate({
        where: {
          ...condoFilter,
          status: "completed",
          deletedAt: null,
        },
        _sum: {
          amount: true,
        },
      }),

      // SERVICE FEES
      prisma.serviceFee.count({
        where: condoFilter,
      }),

      prisma.serviceFee.count({
        where: {
          ...condoFilter,
          status: "collected",
        },
      }),

      prisma.serviceFee.count({
        where: {
          ...condoFilter,
          status: "pending",
        },
      }),

      prisma.serviceFee.aggregate({
        where: {
          ...condoFilter,
          status: "collected",
        },
        _sum: {
          feeAmount: true,
        },
      }),

      // REPORTS
      prisma.report.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      prisma.report.count({
        where: {
          ...condoFilter,
          status: "reported",
          deletedAt: null,
        },
      }),

      prisma.report.count({
        where: {
          ...condoFilter,
          status: "in_progress",
          deletedAt: null,
        },
      }),

      prisma.report.count({
        where: {
          ...condoFilter,
          status: "resolved",
          deletedAt: null,
        },
      }),

      // LOST & FOUND
      prisma.lostFound.count({
        where: {
          ...condoFilter,
          deletedAt: null,
        },
      }),

      prisma.lostFound.count({
        where: {
          ...condoFilter,
          status: "open",
          deletedAt: null,
        },
      }),

      prisma.lostFound.count({
        where: {
          ...condoFilter,
          status: "claimed",
          deletedAt: null,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: unverifiedUsers,
        residents,
        guards,
        condoAdmins,
        superAdmins,
        inEqub: usersInEqub,
        inIddir: usersInIddir,
      },

      condos: {
        total: condos,
        active: activeCondos,
      },

      blocks: {
        total: blocks,
      },

      rooms: {
        total: rooms,
        occupied: occupiedRooms,
        free: freeRooms,
        reserved: reservedRooms,
      },

      equbs: {
        total: totalEqubs,
        pending: pendingEqubs,
        active: activeEqubs,
        completed: completedEqubs,
        cancelled: cancelledEqubs,
        totalMembers: totalEqubMembers,
        totalPayouts: totalEqubPayouts,
      },

      iddirs: {
        total: totalIddirs,
        active: activeIddirs,
        inactive: inactiveIddirs,
        totalMembers: totalIddirMembers,
      },

      payments: {
        total: totalPayments,
        pending: pendingPayments,
        approved: approvedPayments,
        rejected: rejectedPayments,
        totalApprovedAmount: Number(approvedPaymentAggregate._sum.totalAmount || 0),
        byType: {
          equb: equbPayments,
          iddir: iddirPayments,
          guardFee: guardFeePayments,
          serviceCharge: serviceChargePayments,
        },
      },

      transactions: {
        total: totalTransactions,
        completed: completedTransactions,
        pending: pendingTransactions,
        failed: failedTransactions,
        reversed: reversedTransactions,
        totalCompletedVolume: Number(completedTransactionAggregate._sum.amount || 0),
      },

      serviceFees: {
        total: totalServiceFees,
        collected: collectedServiceFees,
        pending: pendingServiceFees,
        totalCollectedAmount: Number(collectedServiceFeeAggregate._sum.feeAmount || 0),
      },

      reports: {
        total: totalReports,
        reported: reportedReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
      },

      lostAndFound: {
        total: totalLostFound,
        open: openLostFound,
        claimed: claimedLostFound,
      },
    };
  };




// ADMIN — ADD USER TO EQUB

export const adminAddUserToEqubService =
  async (currentUser, payload) => {

    const { userId, equbId } = payload;


    if (!userId || !equbId) {
      throw new AppError(
        "userId and equbId are required",
        400
      );
    }


    const admin = await prisma.user.findFirst({
      where: {
        id: String(currentUser.id),
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        condoId: true,
      },
    });


    if (!admin) {
      throw new AppError(
        "Admin account not found",
        404
      );
    }


    // ── 1. Fetch the equb ──────────────────────────────────────────────────

    const equb = await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
      },
    });


    if (!equb) {
      throw new AppError(
        "Equb not found",
        404
      );
    }


    // ── 2. Scope check — condo admin can only manage their own condo ───────

    if (
      admin.role === "condo_admin" &&
      admin.condoId !== equb.condoId
    ) {
      throw new AppError(
        "You can only manage Equbs in your own condominium",
        403
      );
    }


    // ── 3. Equb must be in a manageable state ─────────────────────────────

    if (
      equb.status === "cancelled" ||
      equb.status === "completed"
    ) {
      throw new AppError(
        `Cannot add members to a ${equb.status} Equb`,
        400
      );
    }


    // ── 4. Fetch the target user ──────────────────────────────────────────

    const targetUser = await prisma.user.findFirst({
      where: {
        id: String(userId),
        deletedAt: null,
      },
    });


    if (!targetUser) {
      throw new AppError(
        "User not found",
        404
      );
    }


    // ── 5. User must belong to the same condo as the equb ────────────────

    if (targetUser.condoId !== equb.condoId) {
      throw new AppError(
        "User does not belong to the same condominium as this Equb",
        400
      );
    }


    // ── 6. Check / handle existing membership ────────────────────────────

    const existing = await prisma.equbMember.findUnique({
      where: {
        equbId_userId: {
          equbId: equb.id,
          userId: targetUser.id,
        },
      },
    });


    if (existing && existing.status === "active") {
      throw new AppError(
        "User is already an active member of this Equb",
        409
      );
    }


    // ── 7. Create or re-activate membership (with relations included) ─────

    const memberInclude = {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          fan: true,
          condoId: true,
        },
      },
      equb: {
        select: {
          id: true,
          name: true,
          status: true,
          condoId: true,
          condo: {
            select: {
              id: true,
              condoCode: true,
              condoName: true,
            },
          },
        },
      },
    };


    let member;

    if (existing) {

      member = await prisma.equbMember.update({
        where: { id: existing.id },
        data: {
          status: "active",
          joinedAt: new Date(),
          leftAt: null,
        },
        include: memberInclude,
      });

    } else {

      member = await prisma.equbMember.create({
        data: {
          equbId: equb.id,
          userId: targetUser.id,
          condoId: equb.condoId,
          status: "active",
          joinedAt: new Date(),
        },
        include: memberInclude,
      });
    }


    // ── 8. Update equb member count ───────────────────────────────────────

    const activeCount = await prisma.equbMember.count({
      where: {
        equbId: equb.id,
        status: "active",
      },
    });

    await prisma.equb.update({
      where: { id: equb.id },
      data: { noMembers: activeCount },
    });


    // ── 9. Stamp the user — record which admin added them & set flag ──────

    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        addToEqubById: admin.id,
        isInEqub: true,
      },
    });


    return {
      member,
      activeMembers: activeCount,
      addedBy: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        condoId: admin.condoId,
      },
    };
  };


// ADMIN — REMOVE USER FROM EQUB

export const adminRemoveUserFromEqubService =
  async (currentUser, equbId, userId) => {


    // ── 0. Fetch the full admin record from DB ────────────────────────────

    const admin = await prisma.user.findFirst({
      where: {
        id: String(currentUser.id),
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        condoId: true,
      },
    });


    if (!admin) {
      throw new AppError(
        "Admin account not found",
        404
      );
    }


    // ── 1. Fetch equb ─────────────────────────────────────────────────────

    const equb = await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
      },
    });


    if (!equb) {
      throw new AppError(
        "Equb not found",
        404
      );
    }


    // ── 2. Scope check ────────────────────────────────────────────────────

    if (
      admin.role === "condo_admin" &&
      admin.condoId !== equb.condoId
    ) {
      throw new AppError(
        "You can only manage Equbs in your own condominium",
        403
      );
    }


    // ── 3. Find membership (by equbId_userId OR fallback by equbMember.id) ─

    let member = await prisma.equbMember.findUnique({
      where: {
        equbId_userId: {
          equbId: equb.id,
          userId: String(userId),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
          },
        },
      },
    });

    if (!member) {
      member = await prisma.equbMember.findFirst({
        where: {
          id: String(userId),
          equbId: equb.id,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
      });
    }

    if (!member) {
      throw new AppError(
        "User is not a member of this Equb",
        404
      );
    }

    if (member.status === "inactive") {
      const activeCount = await prisma.equbMember.count({
        where: {
          equbId: equb.id,
          status: "active",
        },
      });
      return {
        removed: true,
        alreadyInactive: true,
        message: `User ${member.user?.fullName || ''} is already inactive/removed from this Equb`,
        member,
        activeMembers: activeCount,
        removedBy: {
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          condoId: admin.condoId,
        },
      };
    }


    // ── 4. Deactivate membership ──────────────────────────────────────────

    const updated = await prisma.equbMember.update({
      where: { id: member.id },
      data: {
        status: "inactive",
        leftAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
          },
        },
        equb: {
          select: {
            id: true,
            name: true,
            status: true,
            condo: {
              select: {
                id: true,
                condoCode: true,
                condoName: true,
              },
            },
          },
        },
      },
    });


    // ── 5. Update equb member count ───────────────────────────────────────

    const activeCount = await prisma.equbMember.count({
      where: {
        equbId: equb.id,
        status: "active",
      },
    });

    await prisma.equb.update({
      where: { id: equb.id },
      data: { noMembers: activeCount },
    });


    // ── 6. Update user's isInEqub flag if no other active equb memberships ─

    const otherActiveEqubMemberships =
      await prisma.equbMember.count({
        where: {
          userId: String(userId),
          status: "active",
          equbId: { not: equb.id },
        },
      });


    if (otherActiveEqubMemberships === 0) {
      await prisma.user.update({
        where: { id: String(userId) },
        data: { isInEqub: false },
      });
    }


    return {
      removed: true,
      member: updated,
      activeMembers: activeCount,
      removedBy: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        condoId: admin.condoId,
      },
    };
  };


// ADMIN — ADD USER TO IDDIR

export const adminAddUserToIddirService =
  async (currentUser, payload) => {

    const { userId, iddirId } = payload;


    if (!userId || !iddirId) {
      throw new AppError(
        "userId and iddirId are required",
        400
      );
    }


    // ── 0. Fetch the full admin record from DB ────────────────────────────

    const admin = await prisma.user.findFirst({
      where: {
        id: String(currentUser.id),
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        condoId: true,
      },
    });


    if (!admin) {
      throw new AppError(
        "Admin account not found",
        404
      );
    }


    // ── 1. Fetch the iddir ────────────────────────────────────────────────

    const iddir = await prisma.iddir.findFirst({
      where: {
        id: String(iddirId),
        deletedAt: null,
      },
      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
      },
    });


    if (!iddir) {
      throw new AppError(
        "Iddir not found",
        404
      );
    }


    // ── 2. Scope check — condo admin can only manage their own condo ───────

    if (
      admin.role === "condo_admin" &&
      admin.condoId !== iddir.condoId
    ) {
      throw new AppError(
        "You can only manage Iddirs in your own condominium",
        403
      );
    }


    // ── 3. Iddir must be active ───────────────────────────────────────────

    if (iddir.status !== "active") {
      throw new AppError(
        "Cannot add members to an inactive Iddir",
        400
      );
    }


    // ── 4. Fetch the target user ──────────────────────────────────────────

    const targetUser = await prisma.user.findFirst({
      where: {
        id: String(userId),
        deletedAt: null,
      },
    });


    if (!targetUser) {
      throw new AppError(
        "User not found",
        404
      );
    }


    // ── 5. User must belong to the same condo as the iddir ───────────────

    if (targetUser.condoId !== iddir.condoId) {
      throw new AppError(
        "User does not belong to the same condominium as this Iddir",
        400
      );
    }


    // ── 6. Check / handle existing membership ────────────────────────────

    const existing = await prisma.iddirMember.findUnique({
      where: {
        iddirId_userId: {
          iddirId: iddir.id,
          userId: targetUser.id,
        },
      },
    });


    if (existing && existing.status === "active") {
      throw new AppError(
        "User is already an active member of this Iddir",
        409
      );
    }


    // ── 7. Create or re-activate membership (with relations included) ─────

    const memberInclude = {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          fan: true,
          condoId: true,
        },
      },
      iddir: {
        select: {
          id: true,
          name: true,
          status: true,
          condoId: true,
          condo: {
            select: {
              id: true,
              condoCode: true,
              condoName: true,
            },
          },
        },
      },
    };


    let member;

    if (existing) {

      member = await prisma.iddirMember.update({
        where: { id: existing.id },
        data: {
          status: "active",
          joinedAt: new Date(),
          leftAt: null,
        },
        include: memberInclude,
      });

    } else {

      member = await prisma.iddirMember.create({
        data: {
          iddirId: iddir.id,
          userId: targetUser.id,
          status: "active",
          joinedAt: new Date(),
        },
        include: memberInclude,
      });
    }


    // ── 8. Update iddir member count ──────────────────────────────────────

    const activeCount = await prisma.iddirMember.count({
      where: {
        iddirId: iddir.id,
        status: "active",
      },
    });

    await prisma.iddir.update({
      where: { id: iddir.id },
      data: { noMembers: activeCount },
    });


    // ── 9. Stamp the user — record which admin added them & set flag ──────

    await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        addToIddirById: admin.id,
        isInIddir: true,
      },
    });


    return {
      member,
      activeMembers: activeCount,
      addedBy: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        condoId: admin.condoId,
      },
    };
};


// ADMIN — REMOVE USER FROM IDDIR

export const adminRemoveUserFromIddirService =
  async (currentUser, iddirId, userId) => {


    // ── 0. Fetch the full admin record from DB ────────────────────────────

    const admin = await prisma.user.findFirst({
      where: {
        id: String(currentUser.id),
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        condoId: true,
      },
    });


    if (!admin) {
      throw new AppError(
        "Admin account not found",
        404
      );
    }


    // ── 1. Fetch iddir ────────────────────────────────────────────────────

    const iddir = await prisma.iddir.findFirst({
      where: {
        id: String(iddirId),
        deletedAt: null,
      },
      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
      },
    });


    if (!iddir) {
      throw new AppError(
        "Iddir not found",
        404
      );
    }


    // ── 2. Scope check ────────────────────────────────────────────────────

    if (
      admin.role === "condo_admin" &&
      admin.condoId !== iddir.condoId
    ) {
      throw new AppError(
        "You can only manage Iddirs in your own condominium",
        403
      );
    }


    // ── 3. Find membership (by iddirId_userId OR fallback by iddirMember.id) ─

    let member = await prisma.iddirMember.findUnique({
      where: {
        iddirId_userId: {
          iddirId: iddir.id,
          userId: String(userId),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
          },
        },
      },
    });

    if (!member) {
      member = await prisma.iddirMember.findFirst({
        where: {
          id: String(userId),
          iddirId: iddir.id,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
      });
    }

    if (!member) {
      throw new AppError(
        "User is not a member of this Iddir",
        404
      );
    }

    if (member.status === "inactive") {
      const activeCount = await prisma.iddirMember.count({
        where: {
          iddirId: iddir.id,
          status: "active",
        },
      });
      return {
        removed: true,
        alreadyInactive: true,
        message: `User ${member.user?.fullName || ''} is already inactive/removed from this Iddir`,
        member,
        activeMembers: activeCount,
        removedBy: {
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          condoId: admin.condoId,
        },
      };
    }


    // ── 4. Deactivate membership ──────────────────────────────────────────

    const updated = await prisma.iddirMember.update({
      where: { id: member.id },
      data: {
        status: "inactive",
        leftAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
          },
        },
        iddir: {
          select: {
            id: true,
            name: true,
            status: true,
            condo: {
              select: {
                id: true,
                condoCode: true,
                condoName: true,
              },
            },
          },
        },
      },
    });


    // ── 5. Update iddir member count ──────────────────────────────────────

    const activeCount = await prisma.iddirMember.count({
      where: {
        iddirId: iddir.id,
        status: "active",
      },
    });

    await prisma.iddir.update({
      where: { id: iddir.id },
      data: { noMembers: activeCount },
    });


    // ── 6. Update user's isInIddir flag if no other active iddir memberships

    const otherActiveIddirMemberships =
      await prisma.iddirMember.count({
        where: {
          userId: String(userId),
          status: "active",
          iddirId: { not: iddir.id },
        },
      });


    if (otherActiveIddirMemberships === 0) {
      await prisma.user.update({
        where: { id: String(userId) },
        data: { isInIddir: false },
      });
    }


    return {
      removed: true,
      member: updated,
      activeMembers: activeCount,
      removedBy: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
        condoId: admin.condoId,
      },
    };
};


// ── ADMIN LIST EQUBS ─────────────────────────────────────────────────────────

export const getAdminEqubsService = async (currentUser, query = {}) => {
  const {
    search,
    status,
    condoId,
    page = 1,
    limit = 20,
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const where = {
    deletedAt: null,
  };

  if (!isSuperAdmin(currentUser)) {
    where.condoId = currentUser.condoId;
  } else if (condoId) {
    where.condoId = condoId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { createdBy: { fullName: { contains: search, mode: "insensitive" } } },
      { createdBy: { email: { contains: search, mode: "insensitive" } } },
      { condo: { condoName: { contains: search, mode: "insensitive" } } },
      { condo: { condoCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [equbs, total] = await Promise.all([
    prisma.equb.findMany({
      where,
      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                block: true,
                roomNo: true,
                fan: true,
              },
            },
          },
        },
        payouts: {
          include: {
            winner: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
              },
            },
          },
          orderBy: { roundNumber: "asc" },
        },
        payments: {
          where: { status: "approved" },
          select: { id: true, amount: true, userId: true },
        },
        payouts: {
          where: { status: "paid" },
          select: { id: true, amount: true, roundNumber: true },
        },
        _count: {
          select: {
            members: true,
            payouts: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    }),
    prisma.equb.count({ where }),
  ]);

  const formattedEqubs = equbs.map((equb) => {
    const activeMembers = (equb.members || []).filter((m) => m.status === "active");
    const activeMembersCount = activeMembers.length;
    const expectedContribution = activeMembersCount * Number(equb.contributionAmount);
    const approvedPaymentsSum = (equb.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const membersPaidSum = (equb.members || []).reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
    const totalCollected = approvedPaymentsSum > 0 ? approvedPaymentsSum : membersPaidSum;
    const totalDisbursed = (equb.payouts || []).reduce((sum, po) => sum + Number(po.amount), 0);
    const availableBalance = Math.max(0, totalCollected - totalDisbursed);

    return {
      ...equb,
      activeMembersCount,
      expectedContribution,
      totalCollected,
      totalDisbursed,
      availableBalance,
    };
  });

  return {
    equbs: formattedEqubs,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};


// ── ADMIN LIST IDDIRS ────────────────────────────────────────────────────────

export const getAdminIddirsService = async (currentUser, query = {}) => {
  const {
    search,
    status,
    condoId,
    page = 1,
    limit = 20,
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const where = {
    deletedAt: null,
  };

  if (!isSuperAdmin(currentUser)) {
    where.condoId = currentUser.condoId;
  } else if (condoId) {
    where.condoId = condoId;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { createdBy: { fullName: { contains: search, mode: "insensitive" } } },
      { createdBy: { email: { contains: search, mode: "insensitive" } } },
      { condo: { condoName: { contains: search, mode: "insensitive" } } },
      { condo: { condoCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [iddirs, total] = await Promise.all([
    prisma.iddir.findMany({
      where,
      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                block: true,
                roomNo: true,
                fan: true,
              },
            },
          },
        },
        payments: {
          where: { status: "approved" },
          select: { id: true, amount: true, userId: true },
        },
        _count: {
          select: {
            members: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    }),
    prisma.iddir.count({ where }),
  ]);

  const formattedIddirs = iddirs.map((iddir) => {
    const activeMembers = (iddir.members || []).filter((m) => m.status === "active");
    const activeMembersCount = activeMembers.length;
    const expectedContribution = activeMembersCount * Number(iddir.contributionAmount);
    const approvedPaymentsSum = (iddir.payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    const membersPaidSum = (iddir.members || []).reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
    const totalCollected = approvedPaymentsSum > 0 ? approvedPaymentsSum : membersPaidSum;
    const totalDisbursed = (iddir.members || []).reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);
    const availableBalance = Math.max(0, totalCollected - totalDisbursed);

    return {
      ...iddir,
      activeMembersCount,
      expectedContribution,
      totalCollected,
      totalDisbursed,
      availableBalance,
    };
  });

  return {
    iddirs: formattedIddirs,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};


// ── ADMIN LIST PAYMENTS ──────────────────────────────────────────────────────

export const getAdminPaymentsService = async (currentUser, query = {}) => {
  const {
    search,
    paymentType,
    status,
    paymentMethod,
    monthYear,
    userId,
    condoId,
    equbId,
    iddirId,
    page = 1,
    limit = 20,
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const where = {};

  if (!isSuperAdmin(currentUser)) {
    where.condoId = currentUser.condoId;
  } else if (condoId) {
    where.condoId = condoId;
  }

  if (paymentType) where.paymentType = paymentType;
  if (status) where.status = status;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (monthYear) where.monthYear = monthYear;
  if (userId) where.userId = userId;
  if (equbId) where.equbId = equbId;
  if (iddirId) where.iddirId = iddirId;

  if (search) {
    where.OR = [
      { user: { fullName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { phoneNumber: { contains: search, mode: "insensitive" } } },
      { user: { fan: { contains: search, mode: "insensitive" } } },
      { transaction: { referenceNo: { contains: search, mode: "insensitive" } } },
      { condo: { condoName: { contains: search, mode: "insensitive" } } },
      { condo: { condoCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
            block: true,
            roomNo: true,
            role: true,
          },
        },
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
        equb: {
          select: {
            id: true,
            name: true,
          },
        },
        iddir: {
          select: {
            id: true,
            name: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        transaction: {
          select: {
            id: true,
            referenceNo: true,
            status: true,
            paymentMethod: true,
            gateway: true,
            amount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};


// ── ADMIN LIST TRANSACTIONS ──────────────────────────────────────────────────

export const getAdminTransactionsService = async (currentUser, query = {}) => {
  const {
    search,
    status,
    paymentType,
    paymentMethod,
    gateway,
    monthYear,
    condoId,
    page = 1,
    limit = 20,
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const where = {
    deletedAt: null,
  };

  if (!isSuperAdmin(currentUser)) {
    where.condoId = currentUser.condoId;
  } else if (condoId) {
    where.condoId = condoId;
  }

  if (status) where.status = status;
  if (paymentType) where.paymentType = paymentType;
  if (paymentMethod) where.paymentMethod = paymentMethod;
  if (gateway) where.gateway = gateway;
  if (monthYear) where.monthYear = monthYear;

  if (search) {
    where.OR = [
      { referenceNo: { contains: search, mode: "insensitive" } },
      { senderName: { contains: search, mode: "insensitive" } },
      { receiverName: { contains: search, mode: "insensitive" } },
      { senderAccNo: { contains: search, mode: "insensitive" } },
      { receiverAccNo: { contains: search, mode: "insensitive" } },
      { sender: { fullName: { contains: search, mode: "insensitive" } } },
      { receiver: { fullName: { contains: search, mode: "insensitive" } } },
      { condo: { condoName: { contains: search, mode: "insensitive" } } },
      { condo: { condoCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
        payment: {
          select: {
            id: true,
            paymentType: true,
            status: true,
            amount: true,
            serviceFee: true,
            totalAmount: true,
          },
        },
        equbPayout: {
          select: {
            id: true,
            roundNumber: true,
            amount: true,
            status: true,
          },
        },
        serviceFee: {
          select: {
            id: true,
            feeAmount: true,
            status: true,
          },
        },
        senderAccount: {
          select: {
            id: true,
            accountName: true,
            accountNumber: true,
            paymentMethod: true,
          },
        },
        receiverAccount: {
          select: {
            id: true,
            accountName: true,
            accountNumber: true,
            paymentMethod: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};


// ── ADMIN LIST SERVICE FEES ──────────────────────────────────────────────────

export const getAdminServiceFeesService = async (currentUser, query = {}) => {
  const {
    status,
    search,
    condoId,
    page = 1,
    limit = 20,
  } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);

  const where = {};

  if (!isSuperAdmin(currentUser)) {
    where.condoId = currentUser.condoId;
  } else if (condoId) {
    where.condoId = condoId;
  }

  if (status) where.status = status;

  if (search) {
    where.OR = [
      { user: { fullName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { transaction: { referenceNo: { contains: search, mode: "insensitive" } } },
      { condo: { condoName: { contains: search, mode: "insensitive" } } },
      { condo: { condoCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  const skip = (pageNumber - 1) * limitNumber;

  const [serviceFees, total] = await Promise.all([
    prisma.serviceFee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
          },
        },
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
        transaction: {
          select: {
            id: true,
            referenceNo: true,
            status: true,
            amount: true,
            paymentMethod: true,
          },
        },
        chapaAccount: {
          select: {
            id: true,
            accountName: true,
            accountNumber: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    }),
    prisma.serviceFee.count({ where }),
  ]);

  return {
    serviceFees,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getAdminCondosService = async (currentUser, query = {}) => {
  const { page = 1, limit = 10, search, status } = query;
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const where = {
    deletedAt: null,
    ...(currentUser.role === "condo_admin" ? { id: currentUser.condoId } : {}),
    ...(status !== undefined ? { activeStatus: status === "true" || status === true } : {}),
    ...(search
      ? {
        OR: [
          { condoName: { contains: search, mode: "insensitive" } },
          { condoCode: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      }
      : {}),
  };

  const [condos, total] = await Promise.all([
    prisma.condo.findMany({
      where,
      include: {
        _count: {
          select: {
            blocks: true,
            rooms: true,
            users: true,
            equbs: true,
            iddirs: true,
            accounts: true,
            payments: true,
          },
        },
        users: {
          where: { role: "condo_admin", deletedAt: null },
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limitNumber,
    }),
    prisma.condo.count({ where }),
  ]);

  return {
    condos,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getAdminCondoByIdService = async (currentUser, condoId) => {
  if (currentUser.role === "condo_admin" && currentUser.condoId !== condoId) {
    throw new AppError("You do not have permission to view this condominium", 403);
  }

  const condo = await prisma.condo.findFirst({
    where: { id: condoId, deletedAt: null },
    include: {
      blocks: {
        where: { deletedAt: null },
        include: {
          _count: { select: { rooms: true } },
        },
      },
      users: {
        where: { role: "condo_admin", deletedAt: null },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
        },
      },
      accounts: {
        where: { status: "active" },
      },
      equbs: {
        where: { deletedAt: null },
        take: 5,
        include: { _count: { select: { members: true } } },
      },
      iddirs: {
        where: { deletedAt: null },
        take: 5,
        include: { _count: { select: { members: true } } },
      },
      _count: {
        select: {
          blocks: true,
          rooms: true,
          users: true,
          equbs: true,
          iddirs: true,
          payments: true,
          transactions: true,
        },
      },
    },
  });

  if (!condo) {
    throw new AppError("Condominium not found", 404);
  }

  return condo;
};

export const getAdminBlocksService = async (currentUser, query = {}) => {
  const { page = 1, limit = 10, search, condoId } = query;
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const targetCondoId = currentUser.role === "condo_admin" ? currentUser.condoId : condoId;

  const where = {
    deletedAt: null,
    ...(targetCondoId ? { condoId: targetCondoId } : {}),
    ...(search ? { blockNo: { contains: search, mode: "insensitive" } } : {}),
  };

  const [blocks, total] = await Promise.all([
    prisma.block.findMany({
      where,
      include: {
        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
          },
        },
        _count: {
          select: { rooms: true },
        },
      },
      orderBy: { blockNo: "asc" },
      skip,
      take: limitNumber,
    }),
    prisma.block.count({ where }),
  ]);

  return {
    blocks,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getAdminBlockByIdService = async (currentUser, blockId) => {
  const block = await prisma.block.findFirst({
    where: { id: blockId, deletedAt: null },
    include: {
      condo: true,
      rooms: {
        where: { deletedAt: null },
        include: {
          occupiedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
        orderBy: [{ floorNo: "asc" }, { roomNo: "asc" }],
      },
    },
  });

  if (!block) {
    throw new AppError("Block not found", 404);
  }

  if (currentUser.role === "condo_admin" && currentUser.condoId !== block.condoId) {
    throw new AppError("You do not have permission to view this block", 403);
  }

  return block;
};

export const getAdminRoomsService = async (currentUser, query = {}) => {
  const { page = 1, limit = 10, search, condoId, blockId, status, model } = query;
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const targetCondoId = currentUser.role === "condo_admin" ? currentUser.condoId : condoId;

  const where = {
    deletedAt: null,
    ...(targetCondoId ? { condoId: targetCondoId } : {}),
    ...(blockId ? { blockId } : {}),
    ...(status ? { status } : {}),
    ...(model ? { model } : {}),
    ...(search ? { roomNo: { contains: search, mode: "insensitive" } } : {}),
  };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      include: {
        block: {
          select: { id: true, blockNo: true, noFloors: true },
        },
        condo: {
          select: { id: true, condoCode: true, condoName: true },
        },
        occupiedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
          },
        },
      },
      orderBy: [{ block: { blockNo: "asc" } }, { roomNo: "asc" }],
      skip,
      take: limitNumber,
    }),
    prisma.room.count({ where }),
  ]);

  return {
    rooms,
    pagination: {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};

export const getAdminRoomByIdService = async (currentUser, roomId) => {
  const room = await prisma.room.findFirst({
    where: { id: roomId, deletedAt: null },
    include: {
      block: true,
      condo: true,
      occupiedBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          fan: true,
        },
      },
    },
  });

  if (!room) {
    throw new AppError("Room not found", 404);
  }

  if (currentUser.role === "condo_admin" && currentUser.condoId !== room.condoId) {
    throw new AppError("You do not have permission to view this room", 403);
  }

  return room;
};



export const getAdminEqubByIdService = async (currentUser, equbId) => {
  const equb = await prisma.equb.findFirst({
    where: { id: equbId, deletedAt: null },
    include: {
      condo: true,
      createdBy: {
        select: { id: true, fullName: true, email: true, phoneNumber: true },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      payouts: {
        include: {
          winner: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: { roundNumber: "desc" },
      },
      payments: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
      _count: {
        select: { members: true, payouts: true, payments: true },
      },
    },
  });

  if (!equb) {
    throw new AppError("Equb not found", 404);
  }

  if (currentUser.role === "condo_admin" && currentUser.condoId !== equb.condoId) {
    throw new AppError("You do not have permission to view this Equb", 403);
  }

  return equb;
};


export const drawAdminEqubWinnerService = async (currentUser, equbId, payload = {}) => {
  const equb = await prisma.equb.findFirst({
    where: { id: equbId, deletedAt: null },
    include: {
      members: {
        where: { status: "active", hasReceivedPayout: false }, // only members who haven't won yet
        include: { user: true },
      },
      payouts: true,
    },
  });

  if (!equb) {
    throw new AppError("Equb not found", 404);
  }

  if (currentUser.role === "condo_admin" && currentUser.condoId !== equb.condoId) {
    throw new AppError("You do not have permission to manage this Equb", 403);
  }

  if (equb.members.length === 0) {
    throw new AppError("All active members have already won in this Equb rotation cycle!", 400);
  }

  let selectedWinner;
  if (payload.winnerUserId) {
    selectedWinner = equb.members.find((m) => m.userId === payload.winnerUserId);
    if (!selectedWinner) {
      throw new AppError("Selected user is not an eligible member for this round (they may have already received their payout)", 400);
    }
  } else {
    // Random lottery draw among remaining eligible members
    const randomIndex = Math.floor(Math.random() * equb.members.length);
    selectedWinner = equb.members[randomIndex];
  }

  const currentRound = (equb.payouts?.length || 0) + 1;
  const activeMembersCount = await prisma.equbMember.count({
    where: { equbId, status: "active" },
  });
  const payoutAmount = activeMembersCount * Number(equb.contributionAmount);
  const selectionReference = `EQB-WIN-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    const payout = await tx.equbPayout.create({
      data: {
        equbId,
        winnerId: selectedWinner.userId,
        createdById: currentUser.id,
        amount: payoutAmount,
        roundNumber: currentRound,
        selectionReference,
        selectedAt: new Date(),
        paidAt: new Date(),
        status: "paid",
      },
      include: {
        winner: {
          select: { id: true, fullName: true, email: true, phoneNumber: true },
        },
      },
    });

    // Mark winner so they wait until all other members get their turn
    await tx.equbMember.update({
      where: { id: selectedWinner.id },
      data: {
        hasReceivedPayout: true,
        payoutCount: { increment: 1 },
      },
    });

    // Check if any eligible members remain who haven't won
    const remainingEligible = await tx.equbMember.count({
      where: { equbId, status: "active", hasReceivedPayout: false },
    });

    if (remainingEligible === 0) {
      await tx.equb.update({
        where: { id: equbId },
        data: { status: "completed" },
      });
    }

    return payout;
  });

  return result;
};


export const getAdminIddirByIdService = async (currentUser, iddirId) => {
  const iddir = await prisma.iddir.findFirst({
    where: { id: iddirId, deletedAt: null },
    include: {
      condo: true,
      createdBy: {
        select: { id: true, fullName: true, email: true, phoneNumber: true, role: true },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
              block: true,
              roomNo: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      payments: {
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phoneNumber: true, block: true, roomNo: true },
          },
          transaction: {
            select: { id: true, referenceNo: true, paymentMethod: true, status: true },
          },
          approvedBy: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
      _count: {
        select: { members: true, payments: true },
      },
    },
  });

  if (!iddir) {
    throw new AppError("Iddir not found", 404);
  }

  if (currentUser.role === "condo_admin" && currentUser.condoId !== iddir.condoId) {
    throw new AppError("You do not have permission to view this Iddir", 403);
  }

  const activeMembers = iddir.members.filter((m) => m.status === "active");
  const activeMembersCount = activeMembers.length;
  const expectedContribution = activeMembersCount * Number(iddir.contributionAmount);

  // Authoritative approved payments
  const approvedPayments = (iddir.payments || []).filter((p) => p.status === "approved");
  const totalCollectedFromPayments = approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaidSumFromMembers = iddir.members.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
  const totalCollected = approvedPayments.length > 0 ? totalCollectedFromPayments : totalPaidSumFromMembers;

  const totalDisbursed = iddir.members.reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);
  const availableBalance = Math.max(0, totalCollected - totalDisbursed);

  return {
    ...iddir,
    activeMembersCount,
    expectedContribution,
    totalCollected,
    totalDisbursed,
    availableBalance,
  };
};


export const adminRecordEqubContributionService = async (currentUser, equbId, userId, payload = {}) => {
  const equb = await prisma.equb.findFirst({
    where: { id: equbId, deletedAt: null },
  });
  if (!equb) throw new AppError("Equb not found", 404);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== equb.condoId) {
    throw new AppError("You do not have permission to manage this Equb", 403);
  }

  const member = await prisma.equbMember.findUnique({
    where: { equbId_userId: { equbId, userId } },
    include: { user: true },
  });
  if (!member) throw new AppError("Member not found in this Equb", 404);

  const amount = Number(payload.amount || equb.contributionAmount);
  if (isNaN(amount) || amount <= 0) {
    throw new AppError("Contribution amount must be a positive number", 400);
  }

  const currentMonthYear = payload.monthYear || new Date().toISOString().slice(0, 7);

  // Check duplicate contribution for this cycle
  const existingApprovedPayment = await prisma.payment.findFirst({
    where: {
      userId,
      equbId,
      monthYear: currentMonthYear,
      status: "approved",
    },
  });

  if (existingApprovedPayment && !payload.allowExtra) {
    throw new AppError(
      `Member "${member.user.fullName}" has already contributed for cycle ${currentMonthYear} (Ref: ${existingApprovedPayment.id.slice(0, 8)}). Duplicate contribution prevented.`,
      409
    );
  }

  const reference = `EQB-CONT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    const txRecord = await tx.transaction.create({
      data: {
        senderId: userId,
        senderName: member.user.fullName,
        receiverId: currentUser.id,
        receiverName: `${equb.name} Treasury`,
        paymentType: "equb",
        paymentMethod: payload.paymentMethod || "bank_transfer",
        amount,
        referenceNo: reference,
        condoId: equb.condoId,
        monthYear: currentMonthYear,
        status: "completed",
      },
    });

    const payment = await tx.payment.create({
      data: {
        userId,
        condoId: equb.condoId,
        equbId,
        paymentType: "equb",
        amount,
        serviceFee: 0,
        totalAmount: amount,
        monthYear: currentMonthYear,
        paymentMethod: payload.paymentMethod || "bank_transfer",
        status: "approved",
        transactionId: txRecord.id,
        approvalDate: new Date(),
        approvedById: currentUser.id,
        paymentDate: new Date(),
        adminNotes: payload.notes || "Admin recorded verified Equb contribution",
      },
    });

    const updatedMember = await tx.equbMember.update({
      where: { id: member.id },
      data: {
        totalPaid: { increment: amount },
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phoneNumber: true, block: true, roomNo: true },
        },
      },
    });

    return { updatedMember, payment, reference };
  });

  return result.updatedMember;
};


export const adminRecordIddirContributionService = async (currentUser, iddirId, userId, payload = {}) => {
  const iddir = await prisma.iddir.findFirst({
    where: { id: iddirId, deletedAt: null },
  });
  if (!iddir) throw new AppError("Iddir not found", 404);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== iddir.condoId) {
    throw new AppError("You do not have permission to manage this Iddir", 403);
  }

  const member = await prisma.iddirMember.findUnique({
    where: { iddirId_userId: { iddirId, userId } },
    include: { user: true },
  });
  if (!member) throw new AppError("Member not found in this Iddir", 404);

  const amount = Number(payload.amount || iddir.contributionAmount);
  if (isNaN(amount) || amount <= 0) {
    throw new AppError("Contribution amount must be a positive number", 400);
  }

  const currentMonthYear = payload.monthYear || new Date().toISOString().slice(0, 7);

  // Check duplicate contribution for this cycle
  const existingApprovedPayment = await prisma.payment.findFirst({
    where: {
      userId,
      iddirId,
      monthYear: currentMonthYear,
      status: "approved",
    },
  });

  if (existingApprovedPayment && !payload.allowExtra) {
    throw new AppError(
      `Member "${member.user.fullName}" has already contributed for cycle ${currentMonthYear} (Ref: ${existingApprovedPayment.id.slice(0, 8)}). Duplicate contribution prevented.`,
      409
    );
  }

  const reference = `IDDIR-CONT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    const txRecord = await tx.transaction.create({
      data: {
        senderId: userId,
        senderName: member.user.fullName,
        receiverId: currentUser.id,
        receiverName: `${iddir.name} Treasury`,
        paymentType: "iddir",
        paymentMethod: payload.paymentMethod || "bank_transfer",
        amount,
        referenceNo: reference,
        condoId: iddir.condoId,
        monthYear: currentMonthYear,
        status: "completed",
      },
    });

    const payment = await tx.payment.create({
      data: {
        userId,
        condoId: iddir.condoId,
        iddirId,
        paymentType: "iddir",
        amount,
        serviceFee: 0,
        totalAmount: amount,
        monthYear: currentMonthYear,
        paymentMethod: payload.paymentMethod || "bank_transfer",
        status: "approved",
        transactionId: txRecord.id,
        approvalDate: new Date(),
        approvedById: currentUser.id,
        paymentDate: new Date(),
        adminNotes: payload.notes || "Admin recorded verified Iddir contribution",
      },
    });

    const updatedMember = await tx.iddirMember.update({
      where: { id: member.id },
      data: {
        totalPaid: { increment: amount },
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phoneNumber: true, block: true, roomNo: true },
        },
      },
    });

    return { updatedMember, payment, reference };
  });

  return result.updatedMember;
};


export const adminDisburseIddirFundService = async (currentUser, iddirId, payload = {}) => {
  const iddir = await prisma.iddir.findFirst({
    where: { id: iddirId, deletedAt: null },
    include: {
      condo: true,
      members: {
        where: { status: "active" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              block: true,
              roomNo: true,
              fan: true,
            },
          },
        },
      },
    },
  });

  if (!iddir) throw new AppError("Iddir not found", 404);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== iddir.condoId) {
    throw new AppError("You do not have permission to disburse funds for this Iddir", 403);
  }

  const { recipientUserId, reason } = payload;
  if (!recipientUserId) {
    throw new AppError("Please select a recipient member to receive the collected money", 400);
  }

  const member = iddir.members.find((m) => m.userId === recipientUserId);
  if (!member) {
    throw new AppError("Selected recipient is not an active member of this Iddir", 404);
  }

  // Calculate total collected vs total disbursed
  const totalCollected = iddir.members.reduce((sum, m) => sum + Number(m.totalPaid || 0), 0);
  const totalDisbursed = iddir.members.reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);
  const availableBalance = Math.max(0, totalCollected - totalDisbursed);

  if (availableBalance <= 0) {
    throw new AppError("No available funds to disburse in this Iddir. Members must contribute first.", 400);
  }

  const amountToDisburse = payload.amount !== undefined && payload.amount !== null && payload.amount !== ""
    ? Number(payload.amount)
    : availableBalance;

  if (isNaN(amountToDisburse) || amountToDisburse <= 0) {
    throw new AppError("Disbursement amount must be a positive number", 400);
  }

  if (amountToDisburse > availableBalance) {
    throw new AppError(
      `Disbursement amount (ETB ${amountToDisburse.toLocaleString()}) exceeds available Iddir fund balance (ETB ${availableBalance.toLocaleString()})`,
      400
    );
  }

  // Check recipient registered bank/payment account
  const recipientAccount = await prisma.userAccount.findFirst({
    where: {
      userId: recipientUserId,
      status: "active",
    },
    orderBy: { isDefault: "desc" },
  });

  if (!recipientAccount) {
    throw new AppError(
      `Cannot disburse funds: Recipient "${member.user.fullName}" does not have an active registered bank or mobile money account. The resident must add a payment account (e.g. CBE or Telebirr) to their profile before funds can be disbursed.`,
      400
    );
  }

  const reference = `IDDIR-DISB-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const result = await prisma.$transaction(async (tx) => {
    // Record disbursement transaction
    const txRecord = await tx.transaction.create({
      data: {
        senderId: currentUser.id,
        senderName: `${currentUser.fullName} (Admin)`,
        receiverId: recipientUserId,
        receiverName: member.user.fullName,
        receiverAccountId: recipientAccount.id,
        receiverAccNo: recipientAccount.accountNumber,
        paymentType: "iddir",
        paymentMethod: recipientAccount.paymentMethod || "bank_transfer",
        amount: amountToDisburse,
        referenceNo: reference,
        condoId: iddir.condoId,
        status: "completed",
      },
    });

    const updatedMember = await tx.iddirMember.update({
      where: { id: member.id },
      data: {
        totalReceived: { increment: amountToDisburse },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            block: true,
            roomNo: true,
            fan: true,
          },
        },
      },
    });

    return { updatedMember, txRecord };
  });

  const remainingBalance = availableBalance - amountToDisburse;

  return {
    iddirId: iddir.id,
    iddirName: iddir.name,
    recipient: result.updatedMember.user,
    recipientAccount: {
      bankName: recipientAccount.providerName || recipientAccount.paymentMethod.toUpperCase(),
      accountNumber: recipientAccount.accountNumber,
      accountName: recipientAccount.accountName,
    },
    amount: amountToDisburse,
    reason: reason || "Iddir mutual aid disbursement",
    reference,
    totalDisbursedToMember: Number(result.updatedMember.totalReceived),
    availableBalanceRemaining: remainingBalance,
    disbursedAt: new Date(),
  };
};


export const createAdminEqubService = async (currentUser, payload) => {
  const condoId = payload.condoId || currentUser.condoId;
  if (!condoId) throw new AppError("Condo ID is required", 400);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== condoId) {
    throw new AppError("You can only create Equbs in your own condominium", 403);
  }

  const condo = await prisma.condo.findFirst({
    where: { id: String(condoId), deletedAt: null },
  });
  if (!condo) throw new AppError("Condominium not found", 404);
  if (!condo.activeStatus) throw new AppError("Condominium is inactive", 400);

  const start = new Date(payload.startDate || new Date());
  const due = new Date(payload.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

  const equb = await prisma.equb.create({
    data: {
      condoId,
      createdById: currentUser.id,
      name: payload.name?.trim(),
      contributionAmount: Number(payload.contributionAmount),
      startDate: start,
      dueDate: due,
      noMembers: 0,
      status: payload.status || "active",
    },
    include: {
      condo: { select: { id: true, condoCode: true, condoName: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
    },
  });

  return equb;
};


export const updateAdminEqubService = async (currentUser, equbId, payload) => {
  const equb = await prisma.equb.findFirst({
    where: { id: equbId, deletedAt: null },
  });
  if (!equb) throw new AppError("Equb not found", 404);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== equb.condoId) {
    throw new AppError("You do not have permission to update this Equb", 403);
  }

  const data = {};
  if (payload.name) data.name = payload.name.trim();
  if (payload.contributionAmount) data.contributionAmount = Number(payload.contributionAmount);
  if (payload.startDate) data.startDate = new Date(payload.startDate);
  if (payload.dueDate) data.dueDate = new Date(payload.dueDate);
  if (payload.status) data.status = payload.status;

  const updated = await prisma.equb.update({
    where: { id: equbId },
    data,
    include: {
      condo: { select: { id: true, condoCode: true, condoName: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
    },
  });

  return updated;
};


export const deleteAdminEqubService = async (currentUser, equbId) => {
  const equb = await prisma.equb.findFirst({
    where: { id: equbId, deletedAt: null },
    include: {
      _count: {
        select: {
          members: { where: { status: "active" } },
          payments: { where: { status: "approved" } },
          payouts: { where: { status: "paid" } },
        },
      },
    },
  });
  if (!equb) throw new AppError("Equb not found", 404);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== equb.condoId) {
    throw new AppError("You do not have permission to delete this Equb", 403);
  }

  const blockers = [];
  if (equb._count.members > 0) {
    blockers.push(`${equb._count.members} active member(s)`);
  }
  if (equb._count.payments > 0) {
    blockers.push(`${equb._count.payments} verified contribution record(s)`);
  }
  if (equb._count.payouts > 0) {
    blockers.push(`${equb._count.payouts} completed payout(s)`);
  }

  if (blockers.length > 0) {
    throw new AppError(
      `Cannot delete Equb "${equb.name}": It has ${blockers.join(", ")}. To discontinue this Equb while preserving historical records, change its status to 'cancelled' instead.`,
      409
    );
  }

  await prisma.equb.update({
    where: { id: equbId },
    data: { deletedAt: new Date(), status: "cancelled" },
  });

  return { message: "Equb deleted successfully" };
};


export const createAdminIddirService = async (currentUser, payload) => {
  const condoId = payload.condoId || currentUser.condoId;
  if (!condoId) throw new AppError("Condo ID is required", 400);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== condoId) {
    throw new AppError("You can only create Iddirs in your own condominium", 403);
  }

  const condo = await prisma.condo.findFirst({
    where: { id: String(condoId), deletedAt: null },
  });
  if (!condo) throw new AppError("Condominium not found", 404);
  if (!condo.activeStatus) throw new AppError("Condominium is inactive", 400);

  const iddir = await prisma.iddir.create({
    data: {
      condoId,
      createdById: currentUser.id,
      name: payload.name?.trim(),
      contributionAmount: Number(payload.contributionAmount),
      startedDate: new Date(payload.startedDate || new Date()),
      noMembers: 0,
      status: payload.status || "active",
    },
    include: {
      condo: { select: { id: true, condoCode: true, condoName: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
    },
  });

  return iddir;
};


export const updateAdminIddirService = async (currentUser, iddirId, payload) => {
  const iddir = await prisma.iddir.findFirst({
    where: { id: iddirId, deletedAt: null },
  });
  if (!iddir) throw new AppError("Iddir not found", 404);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== iddir.condoId) {
    throw new AppError("You do not have permission to update this Iddir", 403);
  }

  const data = {};
  if (payload.name) data.name = payload.name.trim();
  if (payload.contributionAmount) data.contributionAmount = Number(payload.contributionAmount);
  if (payload.startedDate) data.startedDate = new Date(payload.startedDate);
  if (payload.status) data.status = payload.status;

  const updated = await prisma.iddir.update({
    where: { id: iddirId },
    data,
    include: {
      condo: { select: { id: true, condoCode: true, condoName: true } },
      createdBy: { select: { id: true, fullName: true, email: true } },
    },
  });

  return updated;
};


export const deleteAdminIddirService = async (currentUser, iddirId) => {
  const iddir = await prisma.iddir.findFirst({
    where: { id: iddirId, deletedAt: null },
    include: {
      _count: {
        select: {
          members: { where: { status: "active" } },
          payments: { where: { status: "approved" } },
        },
      },
      members: {
        select: { totalReceived: true },
      },
    },
  });
  if (!iddir) throw new AppError("Iddir not found", 404);

  if (currentUser.role === "condo_admin" && currentUser.condoId !== iddir.condoId) {
    throw new AppError("You do not have permission to delete this Iddir", 403);
  }

  const totalDisbursed = iddir.members.reduce((sum, m) => sum + Number(m.totalReceived || 0), 0);
  const blockers = [];
  if (iddir._count.members > 0) {
    blockers.push(`${iddir._count.members} active member(s)`);
  }
  if (iddir._count.payments > 0) {
    blockers.push(`${iddir._count.payments} verified contribution record(s)`);
  }
  if (totalDisbursed > 0) {
    blockers.push(`ETB ${totalDisbursed.toLocaleString()} in aid disbursements`);
  }

  if (blockers.length > 0) {
    throw new AppError(
      `Cannot delete Iddir "${iddir.name}": It has ${blockers.join(", ")}. To discontinue this Iddir while preserving historical records, change its status to 'inactive' instead.`,
      409
    );
  }

  await prisma.iddir.update({
    where: { id: iddirId },
    data: { deletedAt: new Date(), status: "inactive" },
  });

  return { message: "Iddir deleted successfully" };
};
