import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";
import {
  generateReceiptPdfBuffer,
} from "../utils/pdfReceiptGenerator.js";

export const getPaymentReceipt = async (
  requester,
  paymentIdOrRef
) => {
  const payment = await prisma.payment.findFirst({
    where: {
      OR: [
        {
          id: paymentIdOrRef,
        },
        {
          transaction: {
            referenceNo: paymentIdOrRef,
          },
        },
      ],
    },

    include: {
      user: true,

      condo: true,

      equb: true,

      iddir: true,

      transaction: {
        include: {
          chapaAccount: true,
          serviceFee: true,
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
    throw new AppError(
      "Payment receipt not found",
      404
    );
  }

  /*
   * Only approved payments should have
   * official receipts.
   */
  if (payment.status !== "approved") {
    throw new AppError(
      `Receipt cannot be generated because payment status is ${payment.status}`,
      400
    );
  }

  /*
   * Authorization
   */

  const isOwner =
    requester.id === payment.userId;

  const isSuperAdmin =
    requester.role === "super_admin";

  const isCondoAdminOfSameCondo =
    requester.role === "condo_admin" &&
    requester.condoId === payment.condoId;

  if (
    !isOwner &&
    !isSuperAdmin &&
    !isCondoAdminOfSameCondo
  ) {
    throw new AppError(
      "You do not have permission to view this receipt",
      403
    );
  }

  /*
   * Financial information
   */

  const baseAmount =
    Number(payment.amount || 0);

  const serviceFee =
    Number(payment.serviceFee || 0);

  const totalAmount =
    Number(payment.totalAmount || 0);

  /*
   * Receipt / transaction reference
   */

  const referenceNo =
    payment.transaction?.referenceNo ||
    `RCP-${payment.id.slice(0, 8).toUpperCase()}`;

  /*
   * Member details
   */

  let memberDetails = null;

  /*
   * EQUB
   */

  if (
    payment.paymentType === "equb" &&
    payment.equbId
  ) {
    const equbMember =
      await prisma.equbMember.findUnique({
        where: {
          equbId_userId: {
            equbId: payment.equbId,
            userId: payment.userId,
          },
        },
      });

    if (equbMember) {
      memberDetails = {
        type: "equb",

        name:
          payment.equb?.name || "Equb",

        totalPaid:
          Number(equbMember.totalPaid || 0),

        payoutCount:
          equbMember.payoutCount || 0,

        hasReceivedPayout:
          equbMember.hasReceivedPayout || false,
      };
    }
  }

  /*
   * IDDIR
   */

  if (
    payment.paymentType === "iddir" &&
    payment.iddirId
  ) {
    const iddirMember =
      await prisma.iddirMember.findUnique({
        where: {
          iddirId_userId: {
            iddirId: payment.iddirId,
            userId: payment.userId,
          },
        },
      });

    if (iddirMember) {
      memberDetails = {
        type: "iddir",

        name:
          payment.iddir?.name || "Iddir",

        totalPaid:
          Number(iddirMember.totalPaid || 0),

        totalReceived:
          Number(iddirMember.totalReceived || 0),
      };
    }
  }

  /*
   * Service fee percentage
   *
   * Your current system uses 0.34%.
   */

  const serviceFeePercentage =
    payment.transaction?.chapaAccount
      ?.serviceFeePercentage
      ?.toString() || "0.34";

  return {
    receiptNumber: referenceNo,

    receiptDate:
      payment.approvalDate ||
      payment.paymentDate ||
      payment.createdAt,

    status: payment.status,

    financialSummary: {
      baseAmount:
        baseAmount.toFixed(2),

      serviceFee:
        serviceFee.toFixed(2),

      serviceFeePercentage:
        `${serviceFeePercentage}%`,

      totalAmount:
        totalAmount.toFixed(2),

      currency: "ETB",
    },

    paymentDetails: {
      id: payment.id,

      paymentType:
        payment.paymentType,

      paymentMethod:
        payment.paymentMethod,

      monthYear:
        payment.monthYear,

      paymentDate:
        payment.paymentDate,

      approvalDate:
        payment.approvalDate,

      receiptUrl:
        payment.receiptUrl,

      adminNotes:
        payment.adminNotes,
    },

    payer: {
      id: payment.user.id,

      fullName:
        payment.user.fullName,

      email:
        payment.user.email,

      phoneNumber:
        payment.user.phoneNumber,

      fan:
        payment.user.fan,

      senderAccNo:
        payment.transaction?.senderAccNo,

      senderName:
        payment.transaction?.senderName,
    },

    beneficiary: {
      id: payment.condo.id,

      name:
        payment.condo.condoName,

      code:
        payment.condo.condoCode,

      address:
        payment.condo.address,

      city:
        payment.condo.city,
    },

    itemDetails:
      memberDetails,

    transaction:
      payment.transaction
        ? {
            id:
              payment.transaction.id,

            referenceNo:
              payment.transaction.referenceNo,

            stamp:
              payment.transaction.stamp,

            status:
              payment.transaction.status,

            gateway:
              payment.transaction.gateway ||
              "chapa",

            createdAt:
              payment.transaction.createdAt,
          }
        : null,

    approvedBy:
      payment.approvedBy
        ? {
            id:
              payment.approvedBy.id,

            fullName:
              payment.approvedBy.fullName,

            role:
              payment.approvedBy.role,
          }
        : null,
  };
};


/*
 * Generate PDF receipt
 */

export const generatePaymentReceiptPdf = async (
  requester,
  paymentIdOrRef
) => {
  const receiptData =
    await getPaymentReceipt(
      requester,
      paymentIdOrRef
    );

  const pdfBuffer =
    await generateReceiptPdfBuffer(
      receiptData
    );

  return {
    pdfBuffer,

    receiptData,

    fileName:
      `receipt-${receiptData.receiptNumber}.pdf`,
  };
};