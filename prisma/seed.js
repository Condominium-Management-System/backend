import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // CLEAN DATABASE

  await prisma.serviceFee.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.payment.deleteMany();

  await prisma.iddirMember.deleteMany();
  await prisma.iddir.deleteMany();

  await prisma.equbMember.deleteMany();
  await prisma.equbPayout.deleteMany();
  await prisma.equb.deleteMany();

  await prisma.userAccount.deleteMany();
  await prisma.room.deleteMany();
  await prisma.block.deleteMany();

  await prisma.announcement.deleteMany();
  await prisma.report.deleteMany();
  await prisma.lostFound.deleteMany();
  await prisma.chatMessage.deleteMany();
  await prisma.promotion.deleteMany();

  await prisma.user.deleteMany();
  await prisma.condo.deleteMany();

  await prisma.hXAccount.deleteMany();

  console.log("🗑️ Old data removed");

  // PASSWORD

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // CONDO

  const condo = await prisma.condo.create({
    data: {
      condoCode: "YEKONDO-001",
      condoName: "Ye Kondominium",
      address: "Addis Ababa",
      city: "Addis Ababa",
      blockNumbers: ["A", "B"],
      maxAdmins: 3,
      activeStatus: true,
    },
  });

  console.log("🏢 Condo created:", condo.condoName);

  // BLOCKS

  const blockA = await prisma.block.create({
    data: {
      condoId: condo.id,
      blockNo: "A",
      noRooms: 10,
      noFloors: 5,
      availableRooms: 10,
      occupiedRooms: 0,
    },
  });

  const blockB = await prisma.block.create({
    data: {
      condoId: condo.id,
      blockNo: "B",
      noRooms: 10,
      noFloors: 5,
      availableRooms: 10,
      occupiedRooms: 0,
    },
  });

  console.log("🏬 Blocks created");

  // ROOMS

  const rooms = [];

  for (let i = 1; i <= 10; i++) {
    rooms.push({
      condoId: condo.id,
      blockId: blockA.id,
      roomNo: `${i}01`,
      floorNo: Math.ceil(i / 2),
      price: 15000,
      model: i % 2 === 0 ? "one_bedroom" : "studio",
      status: "free",
    });
  }

  for (let i = 1; i <= 10; i++) {
    rooms.push({
      condoId: condo.id,
      blockId: blockB.id,
      roomNo: `${i}01`,
      floorNo: Math.ceil(i / 2),
      price: 18000,
      model: i % 2 === 0 ? "two_bedroom" : "one_bedroom",
      status: "free",
    });
  }

  await prisma.room.createMany({
    data: rooms,
  });

  console.log("🚪 20 rooms created");

  // USERS

  const usersData = [
    {
      fullName: "Super Admin",
      email: "superadmin@yekondo.com",
      phoneNumber: "0911000001",
      fan: "1000000000000001",
      role: "super_admin",
      block: null,
      roomNo: null,
    },

    {
      fullName: "Condo Administrator",
      email: "admin@yekondo.com",
      phoneNumber: "0911000002",
      fan: "1000000000000002",
      role: "condo_admin",
      block: "A",
      roomNo: "101",
    },

    {
      fullName: "Security Guard",
      email: "guard@yekondo.com",
      phoneNumber: "0911000003",
      fan: "1000000000000003",
      role: "guard",
      block: "A",
      roomNo: "102",
    },

    {
      fullName: "Abebe Kebede",
      email: "abebe@yekondo.com",
      phoneNumber: "0911000004",
      fan: "1000000000000004",
      role: "resident",
      block: "A",
      roomNo: "201",
    },

    {
      fullName: "Kebede Alemu",
      email: "kebede@yekondo.com",
      phoneNumber: "0911000005",
      fan: "1000000000000005",
      role: "resident",
      block: "A",
      roomNo: "202",
    },

    {
      fullName: "Dawit Tesfaye",
      email: "dawit@yekondo.com",
      phoneNumber: "0911000006",
      fan: "1000000000000006",
      role: "resident",
      block: "A",
      roomNo: "301",
    },

    {
      fullName: "Samuel Girma",
      email: "samuel@yekondo.com",
      phoneNumber: "0911000007",
      fan: "1000000000000007",
      role: "resident",
      block: "A",
      roomNo: "302",
    },

    {
      fullName: "Henok Mekonnen",
      email: "henok@yekondo.com",
      phoneNumber: "0911000008",
      fan: "1000000000000008",
      role: "resident",
      block: "A",
      roomNo: "401",
    },

    {
      fullName: "Nahom Worku",
      email: "nahom@yekondo.com",
      phoneNumber: "0911000009",
      fan: "1000000000000009",
      role: "resident",
      block: "A",
      roomNo: "402",
    },

    {
      fullName: "Mihret Tadesse",
      email: "mihret@yekondo.com",
      phoneNumber: "0911000010",
      fan: "1000000000000010",
      role: "resident",
      block: "A",
      roomNo: "501",
    },

    {
      fullName: "Meron Getachew",
      email: "meron@yekondo.com",
      phoneNumber: "0911000011",
      fan: "1000000000000011",
      role: "resident",
      block: "A",
      roomNo: "502",
    },

    {
      fullName: "Bethel Solomon",
      email: "bethel@yekondo.com",
      phoneNumber: "0911000012",
      fan: "1000000000000012",
      role: "resident",
      block: "B",
      roomNo: "101",
    },

    {
      fullName: "Liya Haile",
      email: "liya@yekondo.com",
      phoneNumber: "0911000013",
      fan: "1000000000000013",
      role: "resident",
      block: "B",
      roomNo: "201",
    },

    {
      fullName: "Yonas Berhanu",
      email: "yonas@yekondo.com",
      phoneNumber: "0911000014",
      fan: "1000000000000014",
      role: "resident",
      block: "B",
      roomNo: "202",
    },

    {
      fullName: "Fikru Desta",
      email: "fikru@yekondo.com",
      phoneNumber: "0911000015",
      fan: "1000000000000015",
      role: "resident",
      block: "B",
      roomNo: "301",
    },

    {
      fullName: "Hanna Daniel",
      email: "hanna@yekondo.com",
      phoneNumber: "0911000016",
      fan: "1000000000000016",
      role: "resident",
      block: "B",
      roomNo: "302",
    },

    {
      fullName: "Robel Assefa",
      email: "robel@yekondo.com",
      phoneNumber: "0911000017",
      fan: "1000000000000017",
      role: "resident",
      block: "B",
      roomNo: "401",
    },

    {
      fullName: "Sara Mengistu",
      email: "sara@yekondo.com",
      phoneNumber: "0911000018",
      fan: "1000000000000018",
      role: "resident",
      block: "B",
      roomNo: "402",
    },

    {
      fullName: "Biruk Wolde",
      email: "biruk@yekondo.com",
      phoneNumber: "0911000019",
      fan: "1000000000000019",
      role: "resident",
      block: "B",
      roomNo: "501",
    },

    {
      fullName: "Selamawit Yohannes",
      email: "selamawit@yekondo.com",
      phoneNumber: "0911000020",
      fan: "1000000000000020",
      role: "resident",
      block: "B",
      roomNo: "502",
    },
  ];

  const users = [];

  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        condoId: condo.id,
        condoCode: condo.condoCode,
        isVerified: true,
        isInIddir: false,
        isInEqub: false,
        isGetEqub: false,
      },
    });

    users.push(user);
  }

  console.log(`👥 ${users.length} users created`);

  // GET ADMIN

  const admin = users.find(
    (user) => user.role === "condo_admin"
  );

  // IDDIR

  const iddir = await prisma.iddir.create({
    data: {
      condoId: condo.id,
      createdById: admin.id,
      name: "Ye Kondominium Iddir",
      noMembers: 20,
      status: "active",
      startedDate: new Date(),
      contributionAmount: 500,
    },
  });

  console.log("🤝 Iddir created");

  // ADD ALL 20 USERS TO IDDIR

  for (const user of users) {
    await prisma.iddirMember.create({
      data: {
        iddirId: iddir.id,
        userId: user.id,
        status: "active",
        totalPaid: 0,
        totalReceived: 0,
      },
    });

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isInIddir: true,
        addToIddirById: admin.id,
      },
    });
  }

  console.log("👥 20 users added to Iddir");

  // USER BANK ACCOUNTS

  for (let i = 0; i < users.length; i++) {
    const user = users[i];

    await prisma.userAccount.create({
      data: {
        userId: user.id,
        accountType: "bank",
        paymentMethod: "cbe",
        accountName: user.fullName,
        accountNumber: `10000000${String(i + 1).padStart(4, "0")}`,
        providerName: "Commercial Bank of Ethiopia",
        balance: 50000,
        status: "active",
        isDefault: true,
      },
    });
  }

  console.log("🏦 User accounts created");

  // CONDO ACCOUNT

  await prisma.condoAccount.create({
    data: {
      condoId: condo.id,
      accountType: "bank",
      paymentMethod: "cbe",
      accountName: condo.condoName,
      accountNumber: "200000000001",
      providerName: "Commercial Bank of Ethiopia",
      balance: 0,
      status: "active",
      isDefault: true,
    },
  });

  console.log("🏦 Condo account created");

  // HX ACCOUNT

  await prisma.hXAccount.create({
    data: {
      accountName: "HX Payment Gateway",
      accountNumber: "HX-10000001",
      balance: 0,
      serviceFeePercentage: 1.0,
      isActive: true,
    },
  });

  console.log("💳 HX account created");

  // SUMMARY

  console.log("\n====================================");
  console.log("🌱 DATABASE SEED COMPLETED");
  console.log("====================================");

  console.log("\n🔐 LOGIN INFORMATION");
  console.log("------------------------------------");
  console.log("Super Admin");
  console.log("Email: superadmin@yekondo.com");
  console.log("Password: Password123!");

  console.log("\nCondo Admin");
  console.log("Email: admin@yekondo.com");
  console.log("Password: Password123!");

  console.log("\nGuard");
  console.log("Email: guard@yekondo.com");
  console.log("Password: Password123!");

  console.log("\nResident Example");
  console.log("Email: abebe@yekondo.com");
  console.log("Password: Password123!");

  console.log("\n🏢 Condo");
  console.log(`Name: ${condo.condoName}`);
  console.log(`Code: ${condo.condoCode}`);

  console.log("\n🤝 Iddir");
  console.log(`Name: ${iddir.name}`);
  console.log(`Contribution: ${iddir.contributionAmount}`);

  console.log("\n👥 Users:", users.length);
  console.log("====================================\n");
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