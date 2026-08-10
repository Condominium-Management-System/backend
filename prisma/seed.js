
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const residentPassword = await bcrypt.hash("Resident@123", 10);

  const condos = [
    {
      code: "YEKONDO-001",
      name: "Ye Kondominium 01",
      address: "Bole, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-002",
      name: "Ye Kondominium 02",
      address: "Kazanchis, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-003",
      name: "Ye Kondominium 03",
      address: "Megenagna, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-004",
      name: "Ye Kondominium 04",
      address: "Gerji, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-005",
      name: "Ye Kondominium 05",
      address: "CMC, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-006",
      name: "Ye Kondominium 06",
      address: "Ayat, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-007",
      name: "Ye Kondominium 07",
      address: "Lebu, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-008",
      name: "Ye Kondominium 08",
      address: "Jemo, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-009",
      name: "Ye Kondominium 09",
      address: "Sar Bet, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
    {
      code: "YEKONDO-010",
      name: "Ye Kondominium 10",
      address: "Summit, Addis Ababa",
      city: "Addis Ababa",
      blocks: ["A"],
    },
  ];

  const createdUsers = [];

  for (let i = 0; i < condos.length; i++) {
    const condoData = condos[i];

    const condo = await prisma.condo.upsert({
      where: {
        condoCode: condoData.code,
      },
      update: {
        condoName: condoData.name,
        address: condoData.address,
        city: condoData.city,
        activeStatus: true,
        blockNumbers: condoData.blocks,
      },
      create: {
        condoCode: condoData.code,
        condoName: condoData.name,
        address: condoData.address,
        city: condoData.city,
        gpsCoordinates: {
          latitude: 9.03 + i * 0.001,
          longitude: 38.74 + i * 0.001,
        },
        maxAdmins: 3,
        blockNumbers: condoData.blocks,
        activeStatus: true,
        customSettings: {
          lateFee: 50,
          gracePeriod: 7,
          currency: "ETB",
          timezone: "Africa/Addis_Ababa",
        },
      },
    });

    console.log(`✅ Condo ${i + 1}/10: ${condo.condoCode}`);

    const adminEmail = `admin${i + 1}@yekondominium.com`;
    const residentEmail = `resident${i + 1}@yekondominium.com`;

    const adminPhone = `09110000${String(i + 1).padStart(2, "0")}`;
    const residentPhone = `09220000${String(i + 1).padStart(2, "0")}`;

    const adminFan = `100000000000${String(i + 1).padStart(4, "0")}`;
    const residentFan = `200000000000${String(i + 1).padStart(4, "0")}`;

    const admin = await prisma.user.upsert({
      where: {
        email: adminEmail,
      },
      update: {
        fullName: `Condo Admin ${i + 1}`,
        phoneNumber: adminPhone,
        password: adminPassword,
        role: "condo_admin",
        condoId: condo.id,
        condoCode: condo.condoCode,
        fan: adminFan,
        isVerified: true,
        deletedAt: null,
      },
      create: {
        fullName: `Condo Admin ${i + 1}`,
        email: adminEmail,
        phoneNumber: adminPhone,
        password: adminPassword,
        role: "condo_admin",
        condoId: condo.id,
        condoCode: condo.condoCode,
        fan: adminFan,
        isVerified: true,
      },
    });

    console.log(`   👤 Admin: ${admin.email}`);

    const resident = await prisma.user.upsert({
      where: {
        email: residentEmail,
      },
      update: {
        fullName: `Resident ${i + 1}`,
        phoneNumber: residentPhone,
        password: residentPassword,
        role: "resident",
        condoId: condo.id,
        condoCode: condo.condoCode,
        fan: residentFan,
        isVerified: true,
        isInIddir: true,
        isInEqub: true,
        deletedAt: null,
      },
      create: {
        fullName: `Resident ${i + 1}`,
        email: residentEmail,
        phoneNumber: residentPhone,
        password: residentPassword,
        role: "resident",
        condoId: condo.id,
        condoCode: condo.condoCode,
        fan: residentFan,
        isVerified: true,
        isInIddir: true,
        isInEqub: true,
      },
    });

    console.log(`   👤 Resident: ${resident.email}`);

    createdUsers.push(admin, resident);

    const block = await prisma.block.upsert({
      where: {
        condoId_blockNo: {
          condoId: condo.id,
          blockNo: "A",
        },
      },
      update: {
        noRooms: 3,
        noFloors: 3,
        availableRooms: 2,
        occupiedRooms: 1,
        deletedAt: null,
      },
      create: {
        condoId: condo.id,
        blockNo: "A",
        noRooms: 3,
        noFloors: 3,
        availableRooms: 2,
        occupiedRooms: 1,
      },
    });

    console.log(`   🏢 Block A created`);

    await prisma.room.upsert({
      where: {
        blockId_roomNo: {
          blockId: block.id,
          roomNo: "101",
        },
      },
      update: {
        occupiedById: resident.id,
        status: "occupied",
        deletedAt: null,
      },
      create: {
        condoId: condo.id,
        blockId: block.id,
        roomNo: "101",
        floorNo: 1,
        price: 500000,
        model: "two_bedroom",
        status: "occupied",
        occupiedById: resident.id,
      },
    });

    await prisma.room.upsert({
      where: {
        blockId_roomNo: {
          blockId: block.id,
          roomNo: "102",
        },
      },
      update: {
        status: "free",
        occupiedById: null,
        deletedAt: null,
      },
      create: {
        condoId: condo.id,
        blockId: block.id,
        roomNo: "102",
        floorNo: 1,
        price: 500000,
        model: "two_bedroom",
        status: "free",
      },
    });

    await prisma.room.upsert({
      where: {
        blockId_roomNo: {
          blockId: block.id,
          roomNo: "103",
        },
      },
      update: {
        status: "free",
        occupiedById: null,
        deletedAt: null,
      },
      create: {
        condoId: condo.id,
        blockId: block.id,
        roomNo: "103",
        floorNo: 1,
        price: 500000,
        model: "two_bedroom",
        status: "free",
      },
    });

    console.log(`   🚪 Rooms created`);

    await prisma.announcement.create({
      data: {
        condoId: condo.id,
        title: `Welcome to ${condo.condoName}`,
        body: `Welcome to ${condo.condoName}. Residents can use the application for payments, reports, announcements, lost and found, chat and community services.`,
        announcementType: "general",
        isPinned: true,
        createdById: admin.id,
        createdByRole: "admin",
        isPublic: true,
      },
    });

    await prisma.promotion.create({
      data: {
        condoId: condo.id,
        type: "shop",
        title: `Local Shop - ${condo.condoCode}`,
        description: "Sample shop promotion for testing.",
        price: 100,
        postedById: resident.id,
        postedByRole: "resident",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        contactNumber: residentPhone,
      },
    });

    await prisma.equb.create({
      data: {
        condoId: condo.id,
        createdById: admin.id,
        name: `Monthly Equb - ${condo.condoCode}`,
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

    await prisma.iddir.create({
      data: {
        condoId: condo.id,
        createdById: admin.id,
        name: `Community Iddir - ${condo.condoCode}`,
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

    console.log(`   📢 Announcement created`);
    console.log(`   📣 Promotion created`);
    console.log(`   💰 Equb created`);
    console.log(`   🤝 Iddir created`);
  }

  console.log("\n========================================");
  console.log("🌱 DATABASE SEED COMPLETED");
  console.log("========================================");

  console.log("\n📊 SUMMARY");
  console.log("Condominiums: 10");
  console.log("Users: 20");
  console.log("Admins: 10");
  console.log("Residents: 10");
  console.log("Blocks: 10");
  console.log("Rooms: 30");
  console.log("Announcements: 10");
  console.log("Promotions: 10");
  console.log("Equbs: 10");
  console.log("Iddirs: 10");

  console.log("\n🔐 LOGIN INFORMATION");

  console.log("\nCondo Admins:");
  for (let i = 1; i <= 10; i++) {
    console.log(
      `admin${i}@yekondominium.com / Admin@123`
    );
  }

  console.log("\nResidents:");
  for (let i = 1; i <= 10; i++) {
    console.log(
      `resident${i}@yekondominium.com / Resident@123`
    );
  }

  console.log("\n🏢 CONDO CODES:");

  for (let i = 1; i <= 10; i++) {
    console.log(
      `YEKONDO-${String(i).padStart(3, "0")}`
    );
  }

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

