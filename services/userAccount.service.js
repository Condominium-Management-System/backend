import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";
import {
  createUserAccountValidation,
  updateUserAccountValidation,
} from "../inputValidation/userAccount.validation.js";

// Helper: Normalize payment method to account type
const resolveAccountType = (paymentMethod, accountType) => {
  if (accountType) return accountType;
  if (paymentMethod === "telebirr") return "mobile_money";
  if (paymentMethod === "cbe" || paymentMethod === "bank_transfer" || paymentMethod === "card") return "bank";
  return "wallet";
};

// GET USER ACCOUNTS
export const getUserAccountsService = async (userId) => {
  const accounts = await prisma.userAccount.findMany({
    where: {
      userId,
      status: { not: "inactive" },
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  return accounts;
};

// GET SINGLE USER ACCOUNT
export const getUserAccountByIdService = async (userId, accountId) => {
  const account = await prisma.userAccount.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  return account;
};

// CREATE USER ACCOUNT (CBE, Telebirr, etc.)
export const createUserAccountService = async (userId, payload) => {
  const { error, value } = createUserAccountValidation.validate(payload);

  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const {
    paymentMethod,
    accountType,
    accountName,
    accountNumber,
    providerName,
    isDefault = false,
  } = value;

  const existingAccount = await prisma.userAccount.findFirst({
    where: {
      userId,
      accountNumber: accountNumber.trim(),
    },
  });

  if (existingAccount) {
    if (existingAccount.status === "inactive") {
      // Reactivate
      const updated = await prisma.userAccount.update({
        where: { id: existingAccount.id },
        data: {
          accountName: accountName.trim(),
          paymentMethod,
          accountType: resolveAccountType(paymentMethod, accountType),
          providerName: providerName ? providerName.trim() : null,
          status: "active",
          isDefault,
        },
      });

      if (isDefault) {
        await prisma.userAccount.updateMany({
          where: {
            userId,
            id: { not: existingAccount.id },
          },
          data: { isDefault: false },
        });
      }

      return updated;
    }

    throw new AppError(
      "An account with this number is already registered on your profile",
      409
    );
  }

  // Check if this is user's first account -> make it default automatically
  const existingCount = await prisma.userAccount.count({
    where: {
      userId,
      status: "active",
    },
  });

  const shouldBeDefault = isDefault || existingCount === 0;

  if (shouldBeDefault && existingCount > 0) {
    await prisma.userAccount.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const account = await prisma.userAccount.create({
    data: {
      userId,
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      paymentMethod,
      accountType: resolveAccountType(paymentMethod, accountType),
      providerName: providerName ? providerName.trim() : null,
      balance: 0,
      status: "active",
      isDefault: shouldBeDefault,
    },
  });

  return account;
};

// UPDATE USER ACCOUNT
export const updateUserAccountService = async (userId, accountId, payload) => {
  const { error, value } = updateUserAccountValidation.validate(payload);

  if (error) {
    throw new AppError(error.details[0].message, 400);
  }

  const account = await prisma.userAccount.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  if (value.accountNumber && value.accountNumber !== account.accountNumber) {
    const duplicate = await prisma.userAccount.findFirst({
      where: {
        userId,
        accountNumber: value.accountNumber.trim(),
        id: { not: accountId },
        status: { not: "inactive" },
      },
    });

    if (duplicate) {
      throw new AppError("Another account with this number already exists", 409);
    }
  }

  if (value.isDefault === true) {
    await prisma.userAccount.updateMany({
      where: {
        userId,
        id: { not: accountId },
      },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.userAccount.update({
    where: { id: accountId },
    data: {
      accountName: value.accountName ? value.accountName.trim() : undefined,
      accountNumber: value.accountNumber ? value.accountNumber.trim() : undefined,
      paymentMethod: value.paymentMethod || undefined,
      accountType: value.accountType || undefined,
      providerName: value.providerName !== undefined ? value.providerName : undefined,
      status: value.status || undefined,
      isDefault: value.isDefault !== undefined ? value.isDefault : undefined,
    },
  });

  return updated;
};

// DELETE USER ACCOUNT (Soft-delete: mark inactive)
export const deleteUserAccountService = async (userId, accountId) => {
  const account = await prisma.userAccount.findFirst({
    where: {
      id: accountId,
      userId,
    },
  });

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  await prisma.userAccount.update({
    where: { id: accountId },
    data: {
      status: "inactive",
      isDefault: false,
    },
  });

  // If the deleted account was default, designate the next active account as default
  if (account.isDefault) {
    const nextAccount = await prisma.userAccount.findFirst({
      where: {
        userId,
        status: "active",
      },
      orderBy: { createdAt: "desc" },
    });

    if (nextAccount) {
      await prisma.userAccount.update({
        where: { id: nextAccount.id },
        data: { isDefault: true },
      });
    }
  }

  return { message: "Account removed successfully" };
};

// SET DEFAULT ACCOUNT
export const setDefaultUserAccountService = async (userId, accountId) => {
  const account = await prisma.userAccount.findFirst({
    where: {
      id: accountId,
      userId,
      status: "active",
    },
  });

  if (!account) {
    throw new AppError("Active account not found", 404);
  }

  await prisma.$transaction([
    prisma.userAccount.updateMany({
      where: {
        userId,
        id: { not: accountId },
      },
      data: { isDefault: false },
    }),
    prisma.userAccount.update({
      where: { id: accountId },
      data: { isDefault: true },
    }),
  ]);

  return {
    ...account,
    isDefault: true,
  };
};
