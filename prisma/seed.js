import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || "superadmin@yekondominium.com";
const DEFAULT_SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || "Password123!";
const HASH_ROUNDS = 10;

async function main() {
  console.log("========================================");
  console.log("🚀 HOMEAXIS PRODUCTION SEED PROCESS");
  console.log("========================================");
  console.log("Seeding ONLY Super Administrator credentials...\n");

  const hashedPassword = await bcrypt.hash(DEFAULT_SUPERADMIN_PASSWORD, HASH_ROUNDS);

  // 1. Ensure Super Admin exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: {
      OR: [
        { email: DEFAULT_SUPERADMIN_EMAIL },
        { role: "super_admin" },
      ],
    },
  });

  let superAdmin;
  if (existingSuperAdmin) {
    console.log(`ℹ Found existing Super Admin (${existingSuperAdmin.email}). Ensuring valid configuration...`);
    superAdmin = await prisma.user.update({
      where: { id: existingSuperAdmin.id },
      data: {
        role: "super_admin",
        isVerified: true,
        condoId: null,
        condoCode: null,
        block: null,
        roomNo: null,
        password: existingSuperAdmin.password || hashedPassword,
      },
    });
  } else {
    console.log(`➕ Creating Super Admin: ${DEFAULT_SUPERADMIN_EMAIL}...`);
    superAdmin = await prisma.user.create({
      data: {
        fullName: "System Super Administrator",
        email: DEFAULT_SUPERADMIN_EMAIL,
        phoneNumber: "+251911111111",
        password: hashedPassword,
        role: "super_admin",
        isVerified: true,
        fan: "1000000000000001",
        revenue: 0.00,
        condoId: null,
        condoCode: null,
      },
    });
  }

  // 2. Ensure HomeAxis System Treasury Account exists (required for payment fee processing)
  let hxAccount = await prisma.hXAccount.findFirst({
    where: { isActive: true },
  });

  if (!hxAccount) {
    console.log("➕ Initializing HomeAxis System Treasury Account (HX-SYS-001)...");
    hxAccount = await prisma.hXAccount.create({
      data: {
        accountName: "HomeAxis System Treasury",
        accountNumber: "HX-SYS-001",
        serviceFeePercentage: 0.34,
        balance: 0.00,
        isActive: true,
      },
    });
  } else {
    console.log(`ℹ Found active HomeAxis System Account (${hxAccount.accountNumber})`);
  }

  console.log("\n========================================");
  console.log("🎉 SEEDING COMPLETED (NO MOCK DATA)");
  console.log("========================================");
  console.log(`
Super Admin Account:
  Email    : ${superAdmin.email}
  Full Name: ${superAdmin.fullName}
  Role     : ${superAdmin.role}
  Verified : ${superAdmin.isVerified}
  Password : ${existingSuperAdmin && existingSuperAdmin.password ? "[Existing Password Retained]" : DEFAULT_SUPERADMIN_PASSWORD}

System Account:
  Account  : ${hxAccount.accountName} (${hxAccount.accountNumber})
  Fee Rate : ${hxAccount.serviceFeePercentage}%
========================================
`);
}

main()
  .catch((error) => {
    console.error("\n❌ SEEDING FAILED\n", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
