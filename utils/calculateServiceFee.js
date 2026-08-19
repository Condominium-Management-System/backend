
import Decimal from "decimal.js";

export const calculateServiceFee = (
  amount,
  percentage = process.env.PERCENTAGE || "0.34"
) => {
  const baseAmount = new Decimal(amount).toDecimalPlaces(
    2,
    Decimal.ROUND_HALF_UP
  );

  const serviceFeePercentage = new Decimal(percentage);

  const serviceFee = baseAmount
    .mul(serviceFeePercentage)
    .div(100)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  const totalAmount = baseAmount
    .add(serviceFee)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    baseAmount,
    serviceFee,
    totalAmount,
    baseAmountNum: baseAmount.toNumber(),
    serviceFeeNum: serviceFee.toNumber(),
    totalAmountNum: totalAmount.toNumber(),
    baseAmountStr: baseAmount.toFixed(2),
    serviceFeeStr: serviceFee.toFixed(2),
    totalAmountStr: totalAmount.toFixed(2),
    serviceFeePercentage: serviceFeePercentage.toFixed(2),
  };
};

export const calculatePaymentAmounts = calculateServiceFee;