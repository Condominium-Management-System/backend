import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";
import {
  initializePaymentValidation,
  paymentQueryValidation,
  rejectPaymentValidation,
} from "../inputValidation/payment.validation.js";
import { generatePaymentReference } from "../utils/paymentReference.js";
import { calculateServiceFee } from "../utils/calculateServiceFee.js";

// CREATE / INITIALIZE PAYMENT
export const createPaymentService = async (userId, payload) => {
  const { error, value } = initializePaymentValidation.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const {
    paymentType,
    amount,
    paymentMethod,
    accountId,
    useHxAccount,
    equbId,
    iddirId,
    monthYear,
    adminNotes,
  } = value;

  // 1. Fetch user & condo
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
    },
    include: {
      condo: true,
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.condoId || !user.condo) {
    throw new AppError("You are not assigned to an active condominium", 400);
  }

  // 2. Resolve Payment Source (User's added account vs HX Account)
  let selectedAccount = null;
  let resolvedPaymentMethod = paymentMethod || "others";

  if (accountId) {
    selectedAccount = await prisma.userAccount.findFirst({
      where: {
        id: accountId,
        userId,
        status: "active",
      },
    });

    if (!selectedAccount) {
      throw new AppError("Active payment account not found in your profile", 404);
    }

    resolvedPaymentMethod = selectedAccount.paymentMethod;
  } else if (!useHxAccount) {
    // If not explicitly using HX Account, check for default active account
    const defaultAccount = await prisma.userAccount.findFirst({
      where: {
        userId,
        status: "active",
        isDefault: true,
      },
    });

    if (defaultAccount) {
      selectedAccount = defaultAccount;
      resolvedPaymentMethod = defaultAccount.paymentMethod;
    }
  }

  // 3. Validate Equb membership if equb payment
  if (paymentType === "equb") {
    if (!equbId) {
      throw new AppError("Equb ID is required for an Equb payment", 400);
    }

    const equb = await prisma.equb.findFirst({
      where: {
        id: equbId,
        condoId: user.condoId,
        deletedAt: null,
      },
    });

    if (!equb || equb.status !== "active") {
      throw new AppError("Active Equb not found in your condominium", 404);
    }

    const member = await prisma.equbMember.findFirst({
      where: {
        equbId,
        userId,
        status: "active",
      },
    });

    if (!member) {
      throw new AppError("You are not an active member of this Equb", 403);
    }
  }

  // 4. Validate Iddir membership if iddir payment
  if (paymentType === "iddir") {
    if (!iddirId) {
      throw new AppError("Iddir ID is required for an Iddir payment", 400);
    }

    const iddir = await prisma.iddir.findFirst({
      where: {
        id: iddirId,
        condoId: user.condoId,
        deletedAt: null,
      },
    });

    if (!iddir || iddir.status !== "active") {
      throw new AppError("Active Iddir not found in your condominium", 404);
    }

    const member = await prisma.iddirMember.findFirst({
      where: {
        iddirId,
        userId,
        status: "active",
      },
    });

    if (!member) {
      throw new AppError("You are not an active member of this Iddir", 403);
    }
  }

  // 5. Get active HX Account (for 0.34% service fee calculation)
  let hxAccount = await prisma.hXAccount.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  if (!hxAccount) {
    hxAccount = await prisma.hXAccount.create({
      data: {
        accountName: "HomeAxis System Account",
        accountNumber: "HX-SYS-001",
        serviceFeePercentage: 0.34,
        isActive: true,
      },
    });
  }

  // Calculate 0.34% service fee
  const feePercentage = hxAccount.serviceFeePercentage
    ? hxAccount.serviceFeePercentage.toString()
    : "0.34";

  const amounts = calculateServiceFee(amount, feePercentage);
  const referenceNo = generatePaymentReference();

  // Check duplicate pending payment
  const existingPending = await prisma.payment.findFirst({
    where: {
      userId,
      paymentType,
      status: "pending",
      ...(equbId ? { equbId } : {}),
      ...(iddirId ? { iddirId } : {}),
      ...(monthYear ? { monthYear } : {}),
    },
  });

  if (existingPending) {
    throw new AppError(
      "You already have a pending payment for this item",
      409
    );
  }

  // 6. Execute atomic transaction creation
  const payment = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        senderId: userId,
        senderAccountId: selectedAccount ? selectedAccount.id : null,
        senderAccNo: selectedAccount
          ? selectedAccount.accountNumber
          : (user.phoneNumber || user.fan),
        senderName: selectedAccount
          ? selectedAccount.accountName
          : user.fullName,
        receiverName: user.condo.condoName,
        hxAccountId: hxAccount.id,
        referenceNo,
        stamp: referenceNo,
        paymentType,
        amount: amounts.totalAmount,
        monthYear: monthYear || null,
        paymentMethod: resolvedPaymentMethod,
        gateway: "hx",
        status: "pending",
        condoId: user.condoId,
      },
    });

    const newPayment = await tx.payment.create({
      data: {
        userId,
        condoId: user.condoId,
        equbId: equbId || null,
        iddirId: iddirId || null,
        paymentType,
        amount: amounts.baseAmount,
        serviceFee: amounts.serviceFee,
        totalAmount: amounts.totalAmount,
        monthYear: monthYear || null,
        paymentMethod: resolvedPaymentMethod,
        status: "pending",
        transactionId: transaction.id,
        paymentDate: new Date(),
        adminNotes: adminNotes || null,
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
        condo: true,
        equb: true,
        iddir: true,
        transaction: true,
      },
    });
    await tx.serviceFee.create({
      data: {
        transactionId: transaction.id,
        userId,
        condoId: user.condoId,
        hxAccountId: hxAccount.id,
        percentage: Number(feePercentage),
        baseAmount: amounts.baseAmount,
        feeAmount: amounts.serviceFee,
        status: "pending",
      },
    });

    return newPayment;
  });

  return {
    payment,
    gateway: "hx",
    referenceNo,
    paymentMethod: resolvedPaymentMethod,
    paymentSource: selectedAccount
      ? {
          type: "user_account",
          accountId: selectedAccount.id,
          accountName: selectedAccount.accountName,
          accountNumber: selectedAccount.accountNumber,
          accountType: selectedAccount.accountType,
          paymentMethod: selectedAccount.paymentMethod,
        }
      : {
          type: "hx_account",
          accountName: hxAccount.accountName,
          accountNumber: hxAccount.accountNumber,
        },
    financialSummary: {
      baseAmount: amounts.baseAmountStr,
      serviceFee: amounts.serviceFeeStr,
      serviceFeePercentage: `${feePercentage}%`,
      totalAmount: amounts.totalAmountStr,
      currency: "ETB",
    },
    status: "pending",
  };
};

export const initializePaymentService = createPaymentService;

// GET MY PAYMENTS (Resident)
export const getMyPaymentsService = async (userId, query = {}) => {
  const { error, value } = paymentQueryValidation.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const {
    paymentType,
    status,
    paymentMethod,
    search,
    page = 1,
    limit = 20,
  } = value;

  const currentPage = Math.max(Number(page), 1);
  const currentLimit = Math.min(Math.max(Number(limit), 1), 100);

  const where = {
    userId,
    ...(paymentType ? { paymentType } : {}),
    ...(status ? { status } : {}),
    ...(paymentMethod ? { paymentMethod } : {}),
    ...(search
      ? {
          OR: [
            { transaction: { referenceNo: { contains: search, mode: "insensitive" } } },
            { monthYear: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        condo: {
          select: {
            id: true,
            condoName: true,
            condoCode: true,
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
        transaction: {
          select: {
            id: true,
            referenceNo: true,
            status: true,
            gateway: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    }),
    prisma.payment.count({
      where,
    }),
  ]);

  return {
    payments,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit) || 1,
    },
  };
};

// GET ALL PAYMENTS (Admin)
export const getAllPaymentsService = async (requester, query = {}) => {
  const { error, value } = paymentQueryValidation.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const {
    paymentType,
    status,
    paymentMethod,
    condoId,
    userId,
    search,
    page = 1,
    limit = 20,
  } = value;

  const currentPage = Math.max(Number(page), 1);
  const currentLimit = Math.min(Math.max(Number(limit), 1), 100);

  const where = {};

  if (requester.role === "condo_admin") {
    if (!requester.condoId) {
      throw new AppError("Admin is not assigned to a condominium", 400);
    }
    where.condoId = requester.condoId;
  } else if (requester.role === "super_admin") {
    if (condoId) where.condoId = condoId;
  } else {
    where.userId = requester.id;
  }

  if (userId) where.userId = userId;
  if (paymentType) where.paymentType = paymentType;
  if (status) where.status = status;
  if (paymentMethod) where.paymentMethod = paymentMethod;

  if (search) {
    where.OR = [
      { user: { fullName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { user: { phoneNumber: { contains: search, mode: "insensitive" } } },
      { transaction: { referenceNo: { contains: search, mode: "insensitive" } } },
      { monthYear: { contains: search, mode: "insensitive" } },
    ];
  }

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
          },
        },
        condo: {
          select: {
            id: true,
            condoName: true,
            condoCode: true,
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
        transaction: true,
        approvedBy: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (currentPage - 1) * currentLimit,
      take: currentLimit,
    }),
    prisma.payment.count({
      where,
    }),
  ]);

  return {
    payments,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.ceil(total / currentLimit) || 1,
    },
  };
};

// GET PAYMENT BY ID
export const getPaymentByIdService = async (requester, paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
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
      condo: true,
      equb: true,
      iddir: true,
      transaction: {
        include: {
          hxAccount: true,
          serviceFee: true,
          senderAccount: true,
        },
      },
      approvedBy: {
        select: {
          id: true,
          fullName: true,
          role: true,
        },
      },
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  const isOwner = requester.id === payment.userId;
  const isSuperAdmin = requester.role === "super_admin";
  const isCondoAdmin = requester.role === "condo_admin" && requester.condoId === payment.condoId;

  if (!isOwner && !isSuperAdmin && !isCondoAdmin) {
    throw new AppError("You do not have permission to view this payment", 403);
  }

  return payment;
};

// APPROVE PAYMENT
export const approvePaymentService = async (adminUser, paymentId, adminNotes) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      transaction: true,
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (adminUser.role === "condo_admin" && adminUser.condoId !== payment.condoId) {
    throw new AppError("You do not have permission to approve payments for this condominium", 403);
  }

  if (payment.status === "approved") {
    throw new AppError("This payment has already been approved", 400);
  }

  if (payment.status === "rejected") {
    throw new AppError("Cannot approve a rejected payment", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "approved",
        approvalDate: new Date(),
        approvedById: adminUser.id,
        adminNotes: adminNotes || payment.adminNotes,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
        transaction: true,
      },
    });

    if (payment.transactionId) {
      await tx.transaction.update({
        where: { id: payment.transactionId },
        data: {
          status: "completed",
        },
      });

      await tx.serviceFee.updateMany({
        where: {
          transactionId: payment.transactionId,
          status: "pending",
        },
        data: {
          status: "collected",
          collectedAt: new Date(),
        },
      });
    }

    // If payment is for Equb or Iddir, increment member totalPaid
    if (payment.paymentType === "equb" && payment.equbId) {
      const equbMember = await tx.equbMember.findFirst({
        where: {
          equbId: payment.equbId,
          userId: payment.userId,
        },
      });
      if (equbMember) {
        await tx.equbMember.update({
          where: { id: equbMember.id },
          data: {
            totalPaid: { increment: payment.amount },
          },
        });
      }
    }

    if (payment.paymentType === "iddir" && payment.iddirId) {
      const iddirMember = await tx.iddirMember.findFirst({
        where: {
          iddirId: payment.iddirId,
          userId: payment.userId,
        },
      });
      if (iddirMember) {
        await tx.iddirMember.update({
          where: { id: iddirMember.id },
          data: {
            totalPaid: { increment: payment.amount },
          },
        });
      }
    }

    return updatedPayment;
  });

  return {
    success: true,
    message: "Payment approved successfully",
    payment: result,
  };
};

// REJECT PAYMENT
export const rejectPaymentService = async (adminUser, paymentId, payload = {}) => {
  const { error, value } = rejectPaymentValidation.validate(payload);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      transaction: true,
    },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (adminUser.role === "condo_admin" && adminUser.condoId !== payment.condoId) {
    throw new AppError("You do not have permission to reject payments for this condominium", 403);
  }

  if (payment.status === "rejected") {
    throw new AppError("This payment has already been rejected", 400);
  }

  if (payment.status === "approved") {
    throw new AppError("Cannot reject an already approved payment", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: "rejected",
        adminNotes: value.adminNotes || "Payment rejected by administrator",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        transaction: true,
      },
    });

    if (payment.transactionId) {
      await tx.transaction.update({
        where: { id: payment.transactionId },
        data: {
          status: "failed",
        },
      });

      // 0.34% service fee is applied per transaction regardless of success/failure
      await tx.serviceFee.updateMany({
        where: {
          transactionId: payment.transactionId,
        },
        data: {
          status: "collected",
          collectedAt: new Date(),
        },
      });
    }

    return updatedPayment;
  });

  return {
    success: true,
    message: "Payment rejected successfully",
    payment: result,
  };
};

// CANCEL PENDING PAYMENT (User)
export const cancelPendingPaymentService = async (userId, paymentId) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      userId,
      status: "pending",
    },
    include: {
      transaction: true,
    },
  });

  if (!payment) {
    throw new AppError("Pending payment not found", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "rejected",
        adminNotes: "Payment cancelled by user",
      },
    });

    if (payment.transactionId) {
      await tx.transaction.update({
        where: {
          id: payment.transactionId,
        },
        data: {
          status: "failed",
        },
      });

      // 0.34% service fee is retained per transaction attempt
      await tx.serviceFee.updateMany({
        where: {
          transactionId: payment.transactionId,
        },
        data: {
          status: "collected",
          collectedAt: new Date(),
        },
      });
    }
  });

  return {
    message: "Payment cancelled successfully",
  };
};

// GET PAYMENT STATISTICS
export const getPaymentStatisticsService = async (requester, query = {}) => {
  let targetCondoId;

  if (requester.role === "resident") {
    throw new AppError("Residents cannot access payment statistics", 403);
  }

  if (requester.role === "condo_admin") {
    targetCondoId = requester.condoId;
  }

  if (requester.role === "super_admin") {
    targetCondoId = query.condoId || undefined;
  }

  const where = {
    ...(targetCondoId ? { condoId: targetCondoId } : {}),
  };

  const [
    totalCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    approvedVolume,
    serviceFeeVolume,
  ] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.count({ where: { ...where, status: "pending" } }),
    prisma.payment.count({ where: { ...where, status: "approved" } }),
    prisma.payment.count({ where: { ...where, status: "rejected" } }),
    prisma.payment.aggregate({
      where: { ...where, status: "approved" },
      _sum: { amount: true, totalAmount: true, serviceFee: true },
    }),
    prisma.serviceFee.aggregate({
      where: {
        ...(targetCondoId ? { condoId: targetCondoId } : {}),
        status: "collected",
      },
      _sum: { feeAmount: true },
    }),
  ]);

  return {
    totalPayments: totalCount,
    pendingPayments: pendingCount,
    approvedPayments: approvedCount,
    rejectedPayments: rejectedCount,
    totalBaseVolume: Number(approvedVolume._sum.amount || 0).toFixed(2),
    totalCollectedVolume: Number(approvedVolume._sum.totalAmount || 0).toFixed(2),
    totalServiceFees: Number(serviceFeeVolume._sum.feeAmount || 0).toFixed(2),
    serviceFeeRate: "0.34%",
  };
};