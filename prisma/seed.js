
import { PrismaClient } from "@prisma/client";
import bcrypt  from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // =========================================================
  // 1. PASSWORDS
  // =========================================================

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const residentPassword = await bcrypt.hash("Resident@123", 10);
  const guardPassword = await bcrypt.hash("Guard@123", 10);

  // =========================================================
  // 2. CONDO
  // =========================================================

  const condo = await prisma.condo.upsert({
    where: {
      condoCode: "YEKONDO-001",
    },
    update: {},
    create: {
      condoCode: "YEKONDO-001",
      condoName: "Ye Kondominium",
      address: "Addis Ababa",
      city: "Addis Ababa",

      gpsCoordinates: {
        latitude: 9.03,
        longitude: 38.74,
      },

      maxAdmins: 3,

      blockNumbers: [
        "A",
        "B",
        "C",
      ],

      activeStatus: true,

      customSettings: {
        lateFee: 50,
        gracePeriod: 7,
        currency: "ETB",
        timezone: "Africa/Addis_Ababa",
      },
    },
  });

  console.log(`✅ Condo created: ${condo.condoName}`);

  // =========================================================
  // 3. SUPER ADMIN
  // =========================================================

  const superAdmin = await prisma.user.upsert({
    where: {
      email: "superadmin@yekondominium.com",
    },
    update: {
      password: adminPassword,
      role: "super_admin",
      condoId: condo.id,
      isVerified: true,
      deletedAt: null,
    },
    create: {
      fullName: "Super Administrator",
      email: "superadmin@yekondominium.com",
      phoneNumber: "0911000001",
      password: adminPassword,
      role: "super_admin",
      condoId: condo.id,
      isVerified: true,
    },
  });

  console.log(`✅ Super admin: ${superAdmin.email}`);

  // =========================================================
  // 4. CONDO ADMIN
  // =========================================================

  const condoAdmin = await prisma.user.upsert({
    where: {
      email: "admin@yekondominium.com",
    },
    update: {
      password: adminPassword,
      role: "condo_admin",
      condoId: condo.id,
      isVerified: true,
      deletedAt: null,
    },
    create: {
      fullName: "Condo Administrator",
      email: "admin@yekondominium.com",
      phoneNumber: "0911000002",
      password: adminPassword,
      role: "condo_admin",
      condoId: condo.id,
      isVerified: true,
    },
  });

  console.log(`✅ Condo admin: ${condoAdmin.email}`);

  // =========================================================
  // 5. GUARD
  // =========================================================

  const guard = await prisma.user.upsert({
    where: {
      email: "guard@yekondominium.com",
    },
    update: {
      password: guardPassword,
      role: "guard",
      condoId: condo.id,
      isVerified: true,
      deletedAt: null,
    },
    create: {
      fullName: "Security Guard",
      email: "guard@yekondominium.com",
      phoneNumber: "0911000003",
      password: guardPassword,
      role: "guard",
      condoId: condo.id,
      isVerified: true,
    },
  });

  console.log(`✅ Guard: ${guard.email}`);

  // =========================================================
  // 6. RESIDENT
  // =========================================================

  const resident = await prisma.user.upsert({
    where: {
      email: "resident@yekondominium.com",
    },
    update: {
      password: residentPassword,
      role: "resident",
      condoId: condo.id,
      isVerified: true,
      deletedAt: null,
    },
    create: {
      fullName: "Test Resident",
      email: "resident@yekondominium.com",
      phoneNumber: "0911000004",
      password: residentPassword,
      role: "resident",
      condoId: condo.id,
      isVerified: true,
      isInIddir: true,
      isInEqub: true,
    },
  });

  console.log(`✅ Resident: ${resident.email}`);

  // =========================================================
  // 7. BLOCK A
  // =========================================================

  const blockA = await prisma.block.upsert({
    where: {
      condoId_blockNo: {
        condoId: condo.id,
        blockNo: "A",
      },
    },
    update: {},
    create: {
      condoId: condo.id,
      blockNo: "A",
      noRooms: 20,
      noFloors: 5,
      availableRooms: 19,
      occupiedRooms: 1,
    },
  });

  console.log(`✅ Block created: ${blockA.blockNo}`);

  // =========================================================
  // 8. BLOCK B
  // =========================================================

  const blockB = await prisma.block.upsert({
    where: {
      condoId_blockNo: {
        condoId: condo.id,
        blockNo: "B",
      },
    },
    update: {},
    create: {
      condoId: condo.id,
      blockNo: "B",
      noRooms: 20,
      noFloors: 5,
      availableRooms: 20,
      occupiedRooms: 0,
    },
  });

  console.log(`✅ Block created: ${blockB.blockNo}`);

  // =========================================================
  // 9. BLOCK C
  // =========================================================

  const blockC = await prisma.block.upsert({
    where: {
      condoId_blockNo: {
        condoId: condo.id,
        blockNo: "C",
      },
    },
    update: {},
    create: {
      condoId: condo.id,
      blockNo: "C",
      noRooms: 20,
      noFloors: 5,
      availableRooms: 20,
      occupiedRooms: 0,
    },
  });

  console.log(`✅ Block created: ${blockC.blockNo}`);

  // =========================================================
  // 10. RESIDENT ROOM
  // =========================================================

  const residentRoom = await prisma.room.upsert({
    where: {
      blockId_roomNo: {
        blockId: blockA.id,
        roomNo: "101",
      },
    },
    update: {
      occupiedById: resident.id,
      status: "occupied",
    },
    create: {
      condoId: condo.id,
      blockId: blockA.id,
      roomNo: "101",
      floorNo: 1,
      price: 500000,
      model: "two_bedroom",
      status: "occupied",
      occupiedById: resident.id,
    },
  });

  console.log(`✅ Resident room: ${residentRoom.roomNo}`);

  // =========================================================
  // 11. FREE ROOMS
  // =========================================================

  const rooms = [
    {
      blockId: blockA.id,
      blockNo: "A",
      roomNo: "102",
      floorNo: 1,
    },
    {
      blockId: blockA.id,
      blockNo: "A",
      roomNo: "103",
      floorNo: 1,
    },
    {
      blockId: blockB.id,
      blockNo: "B",
      roomNo: "101",
      floorNo: 1,
    },
    {
      blockId: blockB.id,
      blockNo: "B",
      roomNo: "102",
      floorNo: 1,
    },
    {
      blockId: blockC.id,
      blockNo: "C",
      roomNo: "101",
      floorNo: 1,
    },
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: {
        blockId_roomNo: {
          blockId: room.blockId,
          roomNo: room.roomNo,
        },
      },
      update: {},
      create: {
        condoId: condo.id,
        blockId: room.blockId,
        roomNo: room.roomNo,
        floorNo: room.floorNo,
        price: 500000,
        model: "two_bedroom",
        status: "free",
      },
    });
  }

  console.log("✅ Free rooms created");

  // =========================================================
  // 12. ANNOUNCEMENT
  // =========================================================

  await prisma.announcement.create({
    data: {
      condoId: condo.id,
      title: "Welcome to Ye Kondominium",
      body:
        "Welcome to the Ye Kondominium Management System. Residents can use the application for payments, reports, announcements, lost and found, chat and community services.",
      announcementType: "general",
      isPinned: true,
      createdById: condoAdmin.id,
      createdByRole: "admin",
      isPublic: true,
    },
  });

  console.log("✅ Announcement created");

  // =========================================================
  // 13. PROMOTION
  // =========================================================

  await prisma.promotion.create({
    data: {
      condoId: condo.id,
      type: "shop",
      title: "Local Shop",
      description: "Sample shop promotion for testing.",
      price: 100,
      postedById: resident.id,
      postedByRole: "resident",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      contactNumber: "0911000004",
    },
  });

  console.log("✅ Promotion created");

  // =========================================================
  // 14. EQUb
  // =========================================================

  await prisma.equb.create({
    data: {
      condoId: condo.id,
      createdById: condoAdmin.id,
      name: "Monthly Community Equb",
      noMembers: 1,

      members: [
        {
          userId: resident.id,
          status: "active",
          joinDate: new Date().toISOString(),
        },
      ],

      status: "active",

      startDate: new Date(),

      dueDate: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),

      contributionAmount: 1000,
    },
  });

  console.log("✅ Equb created");

  // =========================================================
  // 15. IDDIR
  // =========================================================

  await prisma.iddir.create({
    data: {
      condoId: condo.id,
      createdById: condoAdmin.id,
      name: "Community Iddir",
      noMembers: 1,

      members: [
        {
          userId: resident.id,
          status: "active",
          joinDate: new Date().toISOString(),
        },
      ],

      status: "active",
      startedDate: new Date(),
      contributionAmount: 500,
    },
  });

  console.log("✅ Iddir created");

  // =========================================================
  // 16. SUMMARY
  // =========================================================

  console.log("\n========================================");
  console.log("🌱 DATABASE SEED COMPLETED");
  console.log("========================================");

  console.log("\n🔐 LOGIN ACCOUNTS");

  console.log("\nSuper Admin");
  console.log("Email: superadmin@yekondominium.com");
  console.log("Password: Admin@123");

  console.log("\nCondo Admin");
  console.log("Email: admin@yekondominium.com");
  console.log("Password: Admin@123");

  console.log("\nGuard");
  console.log("Email: guard@yekondominium.com");
  console.log("Password: Guard@123");

  console.log("\nResident");
  console.log("Email: resident@yekondominium.com");
  console.log("Password: Resident@123");

  console.log("\n========================================");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

