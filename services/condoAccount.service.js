// express backend/backend/services/condoAccount.service.js
import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";

// Helper: Normalize payment method to account type
const resolveAccountType = (paymentMethod, accountType) => {
  if (accountType && ["bank", "mobile_money", "wallet"].includes(accountType)) return accountType;
  if (paymentMethod === "telebirr") return "mobile_money";
  if (paymentMethod === "cbe" || paymentMethod === "bank_transfer" || paymentMethod === "card") return "bank";
  return "wallet";
};

// Mask account number
export const maskAccNo = (accNo) => {
  if (!accNo) return "N/A";
  const str = String(accNo).trim();
  if (str.length <= 4) return str;
  return `****${str.slice(-4)}`;
};

// GET CONDOMINIUM SOURCE ACCOUNTS
export const getCondoAccountsService = async (currentUser, queryCondoId) => {
  let condoId = currentUser.condoId;

  if (currentUser.role === 'super_admin') {
    condoId = (queryCondoId && queryCondoId !== 'ALL') ? queryCondoId : undefined;
  } else {
    if (!condoId) {
      throw new AppError("Administrator is not associated with any condominium", 400);
    }
  }

  const where = {
    status: { not: "inactive" },
  };

  if (condoId) {
    where.condoId = condoId;
  }

  const accounts = await prisma.condoAccount.findMany({
    where,
    include: {
      condo: {
        select: { id: true, condoName: true, condoCode: true },
      },
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "desc" },
    ],
  });

  return accounts.map(acc => ({
    ...acc,
    maskedAccountNumber: maskAccNo(acc.accountNumber),
  }));
};

// GET SINGLE CONDO SOURCE ACCOUNT BY ID
export const getCondoAccountByIdService = async (currentUser, accountId) => {
  const account = await prisma.condoAccount.findUnique({
    where: { id: accountId },
    include: {
      condo: { select: { id: true, condoName: true, condoCode: true } },
    },
  });

  if (!account) {
    throw new AppError("Condominium source account not found", 404);
  }

  if (currentUser.role === 'condo_admin' && currentUser.condoId !== account.condoId) {
    throw new AppError("You do not have permission to view accounts for another condominium", 403);
  }

  return {
    ...account,
    maskedAccountNumber: maskAccNo(account.accountNumber),
  };
};

// CREATE CONDOMINIUM SOURCE ACCOUNT
export const createCondoAccountService = async (currentUser, payload) => {
  let targetCondoId = currentUser.condoId;
  if (currentUser.role === 'super_admin' && payload.condoId) {
    targetCondoId = payload.condoId;
  }

  if (!targetCondoId) {
    throw new AppError("Condominium ID is required to register a source account", 400);
  }

  const {
    accountName,
    accountNumber,
    paymentMethod = "cbe",
    accountType,
    providerName,
    balance = 0,
    isDefault = false,
  } = payload;

  if (!accountName || !accountName.trim()) {
    throw new AppError("Account name is required", 400);
  }

  if (!accountNumber || !accountNumber.trim() || accountNumber.trim().length < 3) {
    throw new AppError("Valid account number is required", 400);
  }

  const cleanAccNo = accountNumber.trim();

  // Check if account already exists for this condominium
  const existing = await prisma.condoAccount.findUnique({
    where: {
      condoId_accountNumber: {
        condoId: targetCondoId,
        accountNumber: cleanAccNo,
      },
    },
  });

  if (existing) {
    if (existing.status === 'inactive') {
      // Reactivate
      const updated = await prisma.condoAccount.update({
        where: { id: existing.id },
        data: {
          accountName: accountName.trim(),
          paymentMethod,
          accountType: resolveAccountType(paymentMethod, accountType),
          providerName: providerName ? providerName.trim() : null,
          status: 'active',
          balance: Number(balance) || existing.balance,
          isDefault: Boolean(isDefault),
        },
        include: {
          condo: { select: { id: true, condoName: true, condoCode: true } },
        },
      });

      if (isDefault) {
        await prisma.condoAccount.updateMany({
          where: {
            condoId: targetCondoId,
            id: { not: existing.id },
          },
          data: { isDefault: false },
        });
      }

      return {
        ...updated,
        maskedAccountNumber: maskAccNo(updated.accountNumber),
      };
    }

    throw new AppError("This account number is already registered for this condominium", 409);
  }

  // Count existing active accounts
  const activeCount = await prisma.condoAccount.count({
    where: { condoId: targetCondoId, status: 'active' },
  });

  const shouldBeDefault = Boolean(isDefault) || activeCount === 0;

  if (shouldBeDefault && activeCount > 0) {
    await prisma.condoAccount.updateMany({
      where: { condoId: targetCondoId },
      data: { isDefault: false },
    });
  }

  const newAccount = await prisma.condoAccount.create({
    data: {
      condoId: targetCondoId,
      accountName: accountName.trim(),
      accountNumber: cleanAccNo,
      paymentMethod,
      accountType: resolveAccountType(paymentMethod, accountType),
      providerName: providerName ? providerName.trim() : null,
      balance: Number(balance) || 0,
      status: 'active',
      isDefault: shouldBeDefault,
    },
    include: {
      condo: { select: { id: true, condoName: true, condoCode: true } },
    },
  });

  return {
    ...newAccount,
    maskedAccountNumber: maskAccNo(newAccount.accountNumber),
  };
};

// UPDATE CONDOMINIUM SOURCE ACCOUNT
export const updateCondoAccountService = async (currentUser, accountId, payload) => {
  const account = await prisma.condoAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError("Condominium source account not found", 404);
  }

  if (currentUser.role === 'condo_admin' && currentUser.condoId !== account.condoId) {
    throw new AppError("You do not have permission to modify accounts for another condominium", 403);
  }

  if (payload.accountNumber && payload.accountNumber.trim() !== account.accountNumber) {
    const duplicate = await prisma.condoAccount.findUnique({
      where: {
        condoId_accountNumber: {
          condoId: account.condoId,
          accountNumber: payload.accountNumber.trim(),
        },
      },
    });

    if (duplicate && duplicate.id !== accountId && duplicate.status !== 'inactive') {
      throw new AppError("Another account with this number already exists in your condominium", 409);
    }
  }

  if (payload.isDefault === true) {
    await prisma.condoAccount.updateMany({
      where: {
        condoId: account.condoId,
        id: { not: accountId },
      },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.condoAccount.update({
    where: { id: accountId },
    data: {
      accountName: payload.accountName ? payload.accountName.trim() : undefined,
      accountNumber: payload.accountNumber ? payload.accountNumber.trim() : undefined,
      paymentMethod: payload.paymentMethod || undefined,
      accountType: payload.accountType ? resolveAccountType(payload.paymentMethod || account.paymentMethod, payload.accountType) : undefined,
      providerName: payload.providerName !== undefined ? payload.providerName : undefined,
      balance: payload.balance !== undefined ? Number(payload.balance) : undefined,
      status: payload.status || undefined,
      isDefault: payload.isDefault !== undefined ? Boolean(payload.isDefault) : undefined,
    },
    include: {
      condo: { select: { id: true, condoName: true, condoCode: true } },
    },
  });

  return {
    ...updated,
    maskedAccountNumber: maskAccNo(updated.accountNumber),
  };
};

// DELETE CONDOMINIUM SOURCE ACCOUNT (Soft-delete)
export const deleteCondoAccountService = async (currentUser, accountId) => {
  const account = await prisma.condoAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new AppError("Condominium source account not found", 404);
  }

  if (currentUser.role === 'condo_admin' && currentUser.condoId !== account.condoId) {
    throw new AppError("You do not have permission to delete accounts for another condominium", 403);
  }

  await prisma.condoAccount.update({
    where: { id: accountId },
    data: {
      status: 'inactive',
      isDefault: false,
    },
  });

  // Reassign default if deleted account was default
  if (account.isDefault) {
    const nextAcc = await prisma.condoAccount.findFirst({
      where: {
        condoId: account.condoId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (nextAcc) {
      await prisma.condoAccount.update({
        where: { id: nextAcc.id },
        data: { isDefault: true },
      });
    }
  }

  return { message: "Condominium source account deactivated successfully" };
};

// SET DEFAULT CONDOMINIUM SOURCE ACCOUNT
export const setDefaultCondoAccountService = async (currentUser, accountId) => {
  const account = await prisma.condoAccount.findUnique({
    where: { id: accountId, status: 'active' },
  });

  if (!account) {
    throw new AppError("Active condominium source account not found", 404);
  }

  if (currentUser.role === 'condo_admin' && currentUser.condoId !== account.condoId) {
    throw new AppError("You do not have permission to modify accounts for another condominium", 403);
  }

  await prisma.$transaction([
    prisma.condoAccount.updateMany({
      where: {
        condoId: account.condoId,
        id: { not: accountId },
      },
      data: { isDefault: false },
    }),
    prisma.condoAccount.update({
      where: { id: accountId },
      data: { isDefault: true },
    }),
  ]);

  return {
    ...account,
    isDefault: true,
    maskedAccountNumber: maskAccNo(account.accountNumber),
  };
};
