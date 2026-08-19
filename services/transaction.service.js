import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";
import {
  transactionQueryValidation,
  transactionStatisticsValidation,
} from "../inputValidation/transaction.validation.js";

export const getMyTransactions = async (
  userId,
  query = {}
) => {
  const { error, value } = transactionQueryValidation.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError(
      error.details.map((d) => d.message).join(", "),
      400
    );
  }

  const {
    page = 1,
    limit = 10,
    status,
    paymentType,
    paymentMethod,
    gateway,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  } = value;

  const pageNumber =
    Number(page);

  const limitNumber =
    Number(limit);

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const where = {
    OR: [
      {
        senderId: userId,
      },
      {
        receiverId: userId,
      },
    ],

    ...(status
      ? { status }
      : {}),

    ...(paymentType
      ? { paymentType }
      : {}),

    ...(paymentMethod
      ? { paymentMethod }
      : {}),

    ...(gateway
      ? { gateway }
      : {}),

    ...(minAmount !== undefined ||
    maxAmount !== undefined
      ? {
          amount: {
            ...(minAmount !== undefined
              ? {
                  gte:
                    Number(
                      minAmount
                    ),
                }
              : {}),

            ...(maxAmount !== undefined
              ? {
                  lte:
                    Number(
                      maxAmount
                    ),
                }
              : {}),
          },
        }
      : {}),

    ...(startDate ||
    endDate
      ? {
          createdAt: {
            ...(startDate
              ? {
                  gte: new Date(
                    startDate
                  ),
                }
              : {}),

            ...(endDate
              ? {
                  lte: new Date(
                    endDate
                  ),
                }
              : {}),
          },
        }
      : {}),
  };

  const [
    total,
    transactions,
  ] = await Promise.all([
    prisma.transaction.count({
      where,
    }),

    prisma.transaction.findMany({
      where,

      skip,

      take: limitNumber,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },

        receiver: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },

        condo: {
          select: {
            id: true,
            condoName: true,
            condoCode: true,
          },
        },

        payment: {
          select: {
            id: true,
            status: true,
            paymentType: true,
            paymentMethod: true,
            amount: true,
            serviceFee: true,
            totalAmount: true,
            receiptUrl: true,
            approvalDate: true,
            paymentDate: true,
          },
        },

        serviceFee: true,

        senderAccount: true,

        receiverAccount: true,

        senderCondoAccount: true,

        receiverCondoAccount: true,
      },
    }),
  ]);

  return {
    transactions,

    pagination: {
      total,

      page: pageNumber,

      limit: limitNumber,

      totalPages:
        Math.ceil(
          total /
            limitNumber
        ) || 1,
    },
  };
};

export const getAllTransactions = async (
  requester,
  query = {}
) => {
  const { error, value } = transactionQueryValidation.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    throw new AppError(
      error.details.map((d) => d.message).join(", "),
      400
    );
  }

  const {
    page = 1,
    limit = 10,
    status,
    paymentType,
    paymentMethod,
    gateway,
    condoId,
    senderId,
    receiverId,
    search,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  } = value;

  const pageNumber =
    Number(page);

  const limitNumber =
    Number(limit);

  const skip =
    (pageNumber - 1) *
    limitNumber;

  const where = {};

  if (
    requester.role ===
    "resident"
  ) {
    where.senderId =
      requester.id;
  }

  if (
    requester.role ===
    "condo_admin"
  ) {
    if (!requester.condoId) {
      throw new AppError(
        "Admin is not assigned to a condominium",
        400
      );
    }

    where.condoId =
      requester.condoId;
  }

  if (
    requester.role ===
    "super_admin"
  ) {
    if (condoId) {
      where.condoId =
        condoId;
    }

    if (senderId) {
      where.senderId =
        senderId;
    }
  }

  if (receiverId) {
    where.receiverId =
      receiverId;
  }

  if (status) {
    where.status =
      status;
  }

  if (paymentType) {
    where.paymentType =
      paymentType;
  }

  if (paymentMethod) {
    where.paymentMethod =
      paymentMethod;
  }

  if (gateway) {
    where.gateway =
      gateway;
  }

  if (
    minAmount !==
      undefined ||
    maxAmount !==
      undefined
  ) {
    where.amount = {
      ...(minAmount !==
      undefined
        ? {
            gte: Number(
              minAmount
            ),
          }
        : {}),

      ...(maxAmount !==
      undefined
        ? {
            lte: Number(
              maxAmount
            ),
          }
        : {}),
    };
  }

  if (startDate || endDate) {
    where.createdAt = {
      ...(startDate
        ? {
            gte: new Date(
              startDate
            ),
          }
        : {}),

      ...(endDate
        ? {
            lte: new Date(
              endDate
            ),
          }
        : {}),
    };
  }

  if (search) {
    where.OR = [
      {
        referenceNo: {
          contains:
            search,
          mode: "insensitive",
        },
      },

      {
        senderName: {
          contains:
            search,
          mode: "insensitive",
        },
      },

      {
        senderAccNo: {
          contains:
            search,
          mode: "insensitive",
        },
      },

      {
        receiverName: {
          contains:
            search,
          mode: "insensitive",
        },
      },

      {
        receiverAccNo: {
          contains:
            search,
          mode: "insensitive",
        },
      },

      {
        stamp: {
          contains:
            search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [
    total,
    transactions,
  ] = await Promise.all([
    prisma.transaction.count({
      where,
    }),

    prisma.transaction.findMany({
      where,

      skip,

      take: limitNumber,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },

        receiver: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },

        condo: {
          select: {
            id: true,
            condoName: true,
            condoCode: true,
          },
        },

        payment: {
          select: {
            id: true,
            status: true,
            paymentType: true,
            paymentMethod: true,
            amount: true,
            serviceFee: true,
            totalAmount: true,
            receiptUrl: true,
            approvalDate: true,
            paymentDate: true,
          },
        },

        serviceFee: true,

        senderAccount: true,

        receiverAccount: true,

        senderCondoAccount: true,

        receiverCondoAccount: true,
      },
    }),
  ]);

  return {
    transactions,

    pagination: {
      total,

      page: pageNumber,

      limit: limitNumber,

      totalPages:
        Math.ceil(
          total /
            limitNumber
        ) || 1,
    },
  };
};

export const getTransactionById =
  async (
    requester,
    transactionId
  ) => {
    const transaction =
      await prisma.transaction.findUnique(
        {
          where: {
            id: transactionId,
          },

          include: {
            sender: true,

            receiver: true,

            senderAccount: true,

            receiverAccount: true,

            senderCondoAccount: true,

            receiverCondoAccount: true,

            condo: true,

            payment: {
              include: {
                approvedBy: true,
              },
            },

            serviceFee: true,
          },
        }
      );

    if (!transaction) {
      throw new AppError(
        "Transaction not found",
        404
      );
    }

    const allowed =
      requester.id ===
        transaction.senderId ||
      requester.id ===
        transaction.receiverId ||
      requester.role ===
        "super_admin" ||
      (requester.role ===
        "condo_admin" &&
        requester.condoId ===
          transaction.condoId);

    if (!allowed) {
      throw new AppError(
        "You do not have permission to view this transaction",
        403
      );
    }

    return transaction;
  };

export const getTransactionByReference =
  async (
    requester,
    referenceNo
  ) => {
    const transaction =
      await prisma.transaction.findUnique(
        {
          where: {
            referenceNo,
          },

          include: {
            sender: true,

            receiver: true,

            condo: true,

            payment: true,

            serviceFee: true,

            senderAccount: true,

            receiverAccount: true,

            senderCondoAccount: true,

            receiverCondoAccount: true,
          },
        }
      );

    if (!transaction) {
      throw new AppError(
        "Transaction not found with this reference number",
        404
      );
    }

    const allowed =
      requester.id ===
        transaction.senderId ||
      requester.id ===
        transaction.receiverId ||
      requester.role ===
        "super_admin" ||
      (requester.role ===
        "condo_admin" &&
        requester.condoId ===
          transaction.condoId);

    if (!allowed) {
      throw new AppError(
        "You do not have permission to view this transaction",
        403
      );
    }

    return transaction;
  };

export const getTransactionStatistics =
  async (
    requester,
    query = {}
  ) => {
    const { error, value } = transactionStatisticsValidation.validate(query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new AppError(
        error.details.map((d) => d.message).join(", "),
        400
      );
    }

    let targetCondoId;

    if (
      requester.role ===
      "resident"
    ) {
      throw new AppError(
        "Residents cannot access transaction statistics",
        403
      );
    }

    if (
      requester.role ===
      "condo_admin"
    ) {
      targetCondoId =
        requester.condoId;
    }

    if (
      requester.role ===
      "super_admin"
    ) {
      targetCondoId =
        query.condoId ||
        undefined;
    }

    const where = {
      ...(targetCondoId
        ? {
            condoId:
              targetCondoId,
          }
        : {}),
    };

    const [
      totalCount,
      completedCount,
      pendingCount,
      failedCount,
      reversedCount,
      totalCompletedVolume,
    ] = await Promise.all([
      prisma.transaction.count({
        where,
      }),

      prisma.transaction.count({
        where: {
          ...where,

          status: "completed",
        },
      }),

      prisma.transaction.count({
        where: {
          ...where,

          status: "pending",
        },
      }),

      prisma.transaction.count({
        where: {
          ...where,

          status: "failed",
        },
      }),

      prisma.transaction.count({
        where: {
          ...where,

          status: "reversed",
        },
      }),

      prisma.transaction.aggregate({
        where: {
          ...where,

          status: "completed",
        },

        _sum: {
          amount: true,
        },
      }),
    ]);

    return {
      totalTransactions:
        totalCount,

      completedTransactions:
        completedCount,

      pendingTransactions:
        pendingCount,

      failedTransactions:
        failedCount,

      reversedTransactions:
        reversedCount,

      totalVolume:
        Number(
          totalCompletedVolume
            ._sum.amount ||
            0
        ).toFixed(2),
    };
  };