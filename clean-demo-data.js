import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function cleanData() {
  console.log("Starting database cleanup: removing all default and demo data except Super Admin credentials...");

  // 1. Identify or ensure Super Admin exists
  let superAdmin = await prisma.user.findFirst({
    where: { role: "super_admin" },
  });

  const HASH_ROUNDS = 10;
  const defaultPasswordHash = await bcrypt.hash("Password123!", HASH_ROUNDS);

  if (!superAdmin) {
    console.log("No existing Super Admin found. Creating default Super Admin...");
    superAdmin = await prisma.user.create({
      data: {
        fullName: "System Super Administrator",
        email: "superadmin@yekondominium.com",
        phoneNumber: "+251911111111",
        password: defaultPasswordHash,
        role: "super_admin",
        isVerified: true,
        fan: "1000000000000001",
        revenue: 0.0,
      },
    });
  } else {
    console.log(`Found Super Admin: ${superAdmin.email} (ID: ${superAdmin.id})`);
    // Ensure Super Admin has valid hashed password
    if (!superAdmin.password) {
      await prisma.user.update({
        where: { id: superAdmin.id },
        data: { password: defaultPasswordHash },
      });
    }
  }

  // 2. Clear dependent tables in order to respect foreign keys
  console.log("Deleting report responses...");
  await prisma.reportResponse.deleteMany({});

  console.log("Deleting reports...");
  await prisma.report.deleteMany({});

  console.log("Deleting chat messages...");
  await prisma.chatMessage.deleteMany({});

  console.log("Deleting lost & found records...");
  await prisma.lostFound.deleteMany({});

  console.log("Deleting promotions...");
  await prisma.promotion.deleteMany({});

  console.log("Deleting announcements...");
  await prisma.announcement.deleteMany({});

  console.log("Deleting service fees...");
  await prisma.serviceFee.deleteMany({});

  console.log("Deleting transactions...");
  await prisma.transaction.deleteMany({});

  console.log("Deleting payments...");
  await prisma.payment.deleteMany({});

  console.log("Deleting equb payouts...");
  await prisma.equbPayout.deleteMany({});

  console.log("Deleting equb members...");
  await prisma.equbMember.deleteMany({});

  console.log("Deleting equbs...");
  await prisma.equb.deleteMany({});

  console.log("Deleting iddir members...");
  await prisma.iddirMember.deleteMany({});

  console.log("Deleting iddirs...");
  await prisma.iddir.deleteMany({});

  console.log("Deleting user bank accounts...");
  await prisma.userAccount.deleteMany({});

  console.log("Deleting condo bank accounts...");
  await prisma.condoAccount.deleteMany({});

  console.log("Deleting HX accounts...");
  await prisma.hXAccount.deleteMany({});

  console.log("Deleting rooms...");
  await prisma.room.deleteMany({});

  console.log("Deleting blocks...");
  await prisma.block.deleteMany({});

  // 3. Delete all demo users EXCEPT the super admin
  console.log("Deleting all demo users except Super Admin...");
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { not: superAdmin.id },
    },
  });
  console.log(`Deleted ${deletedUsers.count} demo users.`);

  // 4. Detach condo reference from Super Admin and clean any condo fields
  console.log("Cleaning condo associations from Super Admin...");
  await prisma.user.update({
    where: { id: superAdmin.id },
    data: {
      condoId: null,
      condoCode: null,
      block: null,
      roomNo: null,
      isInIddir: false,
      isInEqub: false,
      isGetEqub: false,
      revenue: 0.0,
      isVerified: true,
      role: "super_admin",
      // Set password if needed or ensure Password123!
      password: superAdmin.password || defaultPasswordHash,
    },
  });

  // 5. Delete all condominiums
  console.log("Deleting all demo condominiums...");
  const deletedCondos = await prisma.condo.deleteMany({});
  console.log(`Deleted ${deletedCondos.count} demo condos.`);

  // 6. Confirm database state
  const remainingCondos = await prisma.condo.count();
  const remainingBlocks = await prisma.block.count();
  const remainingRooms = await prisma.room.count();
  const remainingUsers = await prisma.user.count();
  const superAdminCheck = await prisma.user.findFirst({
    where: { role: "super_admin" },
  });

  console.log("\n=== DATABASE CLEANUP COMPLETED ===");
  console.log(`Remaining Condominiums: ${remainingCondos}`);
  console.log(`Remaining Blocks:       ${remainingBlocks}`);
  console.log(`Remaining Rooms:        ${remainingRooms}`);
  console.log(`Remaining Users:        ${remainingUsers}`);
  console.log("\nSuper Admin Credentials:");
  console.log(`  Email:    ${superAdminCheck?.email}`);
  console.log(`  Password: Password123!`);
  console.log(`  Role:     ${superAdminCheck?.role}`);
  console.log(`  Verified: ${superAdminCheck?.isVerified}`);
  console.log(`  ID:       ${superAdminCheck?.id}`);
}

cleanData()
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
