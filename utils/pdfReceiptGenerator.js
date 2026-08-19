import PDFDocument from "pdfkit";

/**
 * Generate a styled PDF receipt buffer for an approved payment
 * @param {object} receiptData
 * @returns {Promise<Buffer>}
 */
export const generateReceiptPdfBuffer = (receiptData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      // Primary Colors
      const primaryColor = "#1e3a8a"; // Dark Blue
      const secondaryColor = "#4b5563"; // Slate Gray
      const accentColor = "#059669"; // Emerald Green
      const lineColor = "#e5e7eb"; // Light Gray

      // Header Branding
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("YE KONDOMINIUM", { align: "center" });

      doc
        .fillColor(secondaryColor)
        .fontSize(11)
        .font("Helvetica")
        .text("HomeAxis Condominium Management System", { align: "center" })
        .moveDown(0.5);

      doc
        .fillColor(accentColor)
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("OFFICIAL PAYMENT RECEIPT", { align: "center" })
        .moveDown(1);

      // Horizontal Divider
      doc
        .strokeColor(lineColor)
        .lineWidth(1)
        .moveTo(40, doc.y)
        .lineTo(555, doc.y)
        .stroke()
        .moveDown(1);

      // Receipt Metadata Table
      const startY = doc.y;
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Receipt Number:", 40, startY)
        .font("Helvetica")
        .fillColor("#111827")
        .text(receiptData.receiptNumber || "N/A", 140, startY);

      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Date of Issue:", 320, startY)
        .font("Helvetica")
        .fillColor("#111827")
        .text(
          receiptData.receiptDate
            ? new Date(receiptData.receiptDate).toLocaleString()
            : new Date().toLocaleString(),
          410,
          startY
        );

      const row2Y = startY + 18;
      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Tx Reference:", 40, row2Y)
        .font("Helvetica")
        .fillColor("#111827")
        .text(receiptData.transaction?.referenceNo || "N/A", 140, row2Y);

      doc
        .fillColor(primaryColor)
        .font("Helvetica-Bold")
        .text("Payment Status:", 320, row2Y)
        .font("Helvetica-Bold")
        .fillColor(receiptData.status === "approved" ? accentColor : "#dc2626")
        .text((receiptData.status || "PENDING").toUpperCase(), 410, row2Y);

      doc.moveDown(2);

      // Section: Condominium & Resident Details
      const detailsY = row2Y + 30;
      doc
        .strokeColor(lineColor)
        .lineWidth(1)
        .moveTo(40, detailsY)
        .lineTo(555, detailsY)
        .stroke();

      // Condominium Details (Left Column)
      const colY = detailsY + 12;
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("CONDOMINIUM DETAILS", 40, colY)
        .moveDown(0.4);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#374151")
        .text(`Name: ${receiptData.beneficiary?.name || "N/A"}`)
        .text(`Condo Code: ${receiptData.beneficiary?.code || "N/A"}`)
        .text(`Address: ${receiptData.beneficiary?.address || "N/A"}`)
        .text(`City: ${receiptData.beneficiary?.city || "Addis Ababa"}`);

      // Resident Details (Right Column)
      doc
        .fillColor(primaryColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("RESIDENT (PAYER)", 320, colY)
        .moveDown(0.4);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#374151")
        .text(`Full Name: ${receiptData.payer?.fullName || "N/A"}`, 320)
        .text(`Phone: ${receiptData.payer?.phoneNumber || "N/A"}`, 320)
        .text(`Email: ${receiptData.payer?.email || "N/A"}`, 320)
        .text(`FAN: ${receiptData.payer?.fan || "N/A"}`, 320);

      doc.moveDown(2);

      // Section: Payment Breakdown Table
      const tableTop = doc.y + 15;
      doc
        .strokeColor(lineColor)
        .lineWidth(1)
        .moveTo(40, tableTop)
        .lineTo(555, tableTop)
        .stroke();

      // Table Header
      const headerY = tableTop + 8;
      doc
        .rect(40, headerY, 515, 22)
        .fill("#f3f4f6");

      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Description", 50, headerY + 6)
        .text("Payment Type", 230, headerY + 6)
        .text("Method", 350, headerY + 6)
        .text("Amount (ETB)", 450, headerY + 6, { align: "right", width: 95 });

      // Table Row 1: Base Amount
      const row1Y = headerY + 28;
      const typeLabel = (receiptData.paymentDetails?.paymentType || "Payment").toUpperCase();
      const methodLabel = (receiptData.paymentDetails?.paymentMethod || "Chapa").toUpperCase();
      const itemName = receiptData.itemDetails?.name
        ? ` (${receiptData.itemDetails.name})`
        : "";

      doc
        .fillColor("#111827")
        .fontSize(10)
        .font("Helvetica")
        .text(`${typeLabel}${itemName}`, 50, row1Y)
        .text(typeLabel, 230, row1Y)
        .text(methodLabel, 350, row1Y)
        .text(
          receiptData.financialSummary?.baseAmount || "0.00",
          450,
          row1Y,
          { align: "right", width: 95 }
        );

      // Table Row 2: Service Fee (0.34%)
      const row2TableY = row1Y + 20;
      doc
        .fillColor("#6b7280")
        .fontSize(9)
        .font("Helvetica")
        .text(`Service Fee (${receiptData.financialSummary?.serviceFeePercentage || "0.34%"})`, 50, row2TableY)
        .text("System Fee", 230, row2TableY)
        .text("Gateway", 350, row2TableY)
        .text(
          receiptData.financialSummary?.serviceFee || "0.00",
          450,
          row2TableY,
          { align: "right", width: 95 }
        );

      // Total Row
      const totalY = row2TableY + 22;
      doc
        .strokeColor(lineColor)
        .lineWidth(1)
        .moveTo(40, totalY)
        .lineTo(555, totalY)
        .stroke();

      doc
        .rect(40, totalY + 4, 515, 24)
        .fill("#ecfdf5");

      doc
        .fillColor(accentColor)
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("TOTAL AMOUNT PAID:", 50, totalY + 10)
        .text(
          `${receiptData.financialSummary?.totalAmount || "0.00"} ETB`,
          450,
          totalY + 10,
          { align: "right", width: 95 }
        );

      doc.moveDown(3);

      // Section: Approval & Verification Info
      const approvalY = totalY + 45;
      doc
        .fillColor(primaryColor)
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("ADMINISTRATIVE VERIFICATION & APPROVAL", 40, approvalY)
        .moveDown(0.3);

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#4b5563")
        .text(`Approved By: ${receiptData.approvedBy?.fullName || "Condominium Administrator"} (${receiptData.approvedBy?.role || "Admin"})`)
        .text(`Approval Date: ${receiptData.paymentDetails?.approvalDate ? new Date(receiptData.paymentDetails.approvalDate).toLocaleString() : new Date().toLocaleString()}`)
        .text(`Notes: ${receiptData.paymentDetails?.adminNotes || "Payment verified and approved successfully."}`);

      // Footer
      doc
        .fontSize(8)
        .fillColor("#9ca3af")
        .text(
          "This is an electronically generated official receipt from HomeAxis / YE KONDOMINIUM. All transactions are securely audited and logged.",
          40,
          750,
          { align: "center", width: 515 }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
