import crypto from "crypto";

export const generatePaymentReference = () => {
  const random = crypto.randomBytes(5).toString("hex").toUpperCase();

  return `HX-${Date.now()}-${random}`;
};