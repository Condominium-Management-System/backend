import {
  getPaymentReceipt,
  generatePaymentReceiptPdf,
} from "../services/receipt.service.js";

export const getPaymentReceiptController =
  async (req, res, next) => {
    try {
      const {
        paymentIdOrRef,
      } = req.params;

      const receipt =
        await getPaymentReceipt(
          req.user,
          paymentIdOrRef
        );

      return res.status(200).json({
        success: true,

        message:
          "Payment receipt retrieved successfully",

        data: receipt,
      });
    } catch (error) {
      next(error);
    }
  };


export const downloadPaymentReceiptController =
  async (req, res, next) => {
    try {
      const {
        paymentIdOrRef,
      } = req.params;

      const {
        pdfBuffer,
        receiptData,
        fileName,
      } =
        await generatePaymentReceiptPdf(
          req.user,
          paymentIdOrRef
        );

      res.set({
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          `attachment; filename="${fileName}"`,

        "Content-Length":
          pdfBuffer.length,
      });

      return res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };


export const viewPaymentReceiptPdfController =
  async (req, res, next) => {
    try {
      const {
        paymentIdOrRef,
      } = req.params;

      const {
        pdfBuffer,
      } =
        await generatePaymentReceiptPdf(
          req.user,
          paymentIdOrRef
        );

      res.set({
        "Content-Type":
          "application/pdf",

        "Content-Disposition":
          "inline",

        "Content-Length":
          pdfBuffer.length,
      });

      return res.status(200).send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };