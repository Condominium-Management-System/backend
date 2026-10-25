import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HASH_ROUNDS = 10;
const DEFAULT_PASSWORD = "Password123!";

async function main() {
  console.log("=================================================================");
  console.log("🚀 HOMEAXIS PRODUCTION SEED — 5 CONDOMINIUMS & FULL RELATIONS");
  console.log("=================================================================\n");

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, HASH_ROUNDS);

  // 1. Initialize HomeAxis System Treasury Account (HX-SYS-001)
  console.log("1. Initializing HomeAxis System Treasury Account...");
  const hxAccount = await prisma.hXAccount.upsert({
    where: { accountNumber: "HX-SYS-001" },
    update: {
      accountName: "HomeAxis System Treasury",
      serviceFeePercentage: 0.34,
      balance: 15420.50,
      isActive: true,
    },
    create: {
      accountName: "HomeAxis System Treasury",
      accountNumber: "HX-SYS-001",
      serviceFeePercentage: 0.34,
      balance: 15420.50,
      isActive: true,
    },
  });
  console.log(`✔ System Account ready: ${hxAccount.accountName} (${hxAccount.accountNumber})\n`);

  // 2. Provision Super Administrators
  console.log("2. Provisioning Super Administrators...");
  const superAdminData = [
    {
      fullName: "System Super Administrator",
      email: "superadmin@yekondominium.com",
      phoneNumber: "+251911000000",
      fan: "1000000000000001",
    },
    {
      fullName: "Shanbel Dires",
      email: "shanbeldires00@gmail.com",
      phoneNumber: "+251911000099",
      fan: "1000000000000099",
    },
  ];

  const superAdmins = [];
  for (const sa of superAdminData) {
    const existing = await prisma.user.findFirst({ where: { email: sa.email } });
    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          fullName: sa.fullName,
          role: "super_admin",
          isVerified: true,
          condoId: null,
          condoCode: null,
          password: existing.password || hashedPassword,
        },
      });
      superAdmins.push(updated);
      console.log(`✔ Preserved Super Admin: ${sa.email}`);
    } else {
      const created = await prisma.user.create({
        data: {
          fullName: sa.fullName,
          email: sa.email,
          phoneNumber: sa.phoneNumber,
          password: hashedPassword,
          role: "super_admin",
          isVerified: true,
          fan: sa.fan,
          revenue: 0.0,
        },
      });
      superAdmins.push(created);
      console.log(`✔ Created Super Admin: ${sa.email}`);
    }
  }

  // 3. Clear existing dependent operational tables for clean relational seed
  console.log("\n3. Resetting operational data for clean relational rebuild...");
  await prisma.reportResponse.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.lostFound.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.announcementRead.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.serviceFee.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.equbPayout.deleteMany({});
  await prisma.equbMember.deleteMany({});
  await prisma.equb.deleteMany({});
  await prisma.iddirClaim.deleteMany({});
  await prisma.iddirMember.deleteMany({});
  await prisma.iddir.deleteMany({});
  await prisma.userAccount.deleteMany({});
  await prisma.condoAccount.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.block.deleteMany({});
  await prisma.user.deleteMany({
    where: { id: { notIn: superAdmins.map((s) => s.id) } },
  });
  await prisma.condo.deleteMany({});
  console.log("✔ Cleared past records.");

  // 4. Define 5 Distinct Condominiums
  console.log("\n4. Creating 5 Full-Scale Condominiums...");
  const condosConfig = [
    {
      condoCode: "HX-5218",
      condoName: "Bole Medhanialem Luxury Condominium",
      address: "Cameroon Street, Behind Edna Mall, Bole",
      city: "Addis Ababa",
      maxAdmins: 3,
      blocks: [
        { blockNo: "A", blockName: "Block A - Abyssinia Tower" },
        { blockNo: "B", blockName: "Block B - Simien Wing" },
      ],
    },
    {
      condoCode: "HX-6655",
      condoName: "CMC Sunshine Heights Village",
      address: "CMC Michael, Near Civil Service University",
      city: "Addis Ababa",
      maxAdmins: 3,
      blocks: [
        { blockNo: "1", blockName: "Block 1 - Sunrise Block" },
        { blockNo: "2", blockName: "Block 2 - Sunset Court" },
      ],
    },
    {
      condoCode: "HX-7120",
      condoName: "Sarbet Diplomatic Residences",
      address: "Old Airport Road, Next to African Union",
      city: "Addis Ababa",
      maxAdmins: 3,
      blocks: [
        { blockNo: "Alpha", blockName: "Block Alpha - Diplomat Tower" },
        { blockNo: "Beta", blockName: "Block Beta - Ambassador Wing" },
      ],
    },
    {
      condoCode: "HX-8430",
      condoName: "Kazanchis Executive Towers",
      address: "Menelik II Avenue, Kazanchis Business District",
      city: "Addis Ababa",
      maxAdmins: 3,
      blocks: [
        { blockNo: "North", blockName: "Tower North - Executive Tower" },
        { blockNo: "South", blockName: "Tower South - Grand View" },
      ],
    },
    {
      condoCode: "HX-9510",
      condoName: "Gerji Imperial Community",
      address: "Imperial Hotel Area, Gerji Main Road",
      city: "Addis Ababa",
      maxAdmins: 3,
      blocks: [
        { blockNo: "G1", blockName: "Block G1 - Imperial Court" },
        { blockNo: "G2", blockName: "Block G2 - Heritage View" },
      ],
    },
  ];

  let fanCounter = 2000000000000000n;

  for (let cIdx = 0; cIdx < condosConfig.length; cIdx++) {
    const cConf = condosConfig[cIdx];
    const cNum = cIdx + 1;

    console.log(`\n--- Provisioning Condominium ${cNum}/5: ${cConf.condoName} (${cConf.condoCode}) ---`);

    // 4A. Create Condo entity
    const condo = await prisma.condo.create({
      data: {
        condoCode: cConf.condoCode,
        condoName: cConf.condoName,
        address: cConf.address,
        city: cConf.city,
        maxAdmins: cConf.maxAdmins,
        blockNumbers: cConf.blocks.map(b => b.blockNo),
        activeStatus: true,
      },
    });

    // 4B. Create Blocks and Rooms
    const createdBlocks = [];
    for (const bConf of cConf.blocks) {
      const block = await prisma.block.create({
        data: {
          blockNo: bConf.blockNo,
          condoId: condo.id,
          noRooms: 10,
          noFloors: 5,
          availableRooms: 6,
          occupiedRooms: 4,
        },
      });
      createdBlocks.push({ ...block, blockName: bConf.blockName });

      // Create rooms in this block
      const roomNumbers = ["101", "102", "201", "202"];
      for (const rNo of roomNumbers) {
        await prisma.room.create({
          data: {
            roomNo: rNo,
            floorNo: parseInt(rNo[0]),
            price: 15000.00,
            model: "two_bedroom",
            status: "occupied",
            condoId: condo.id,
            blockId: block.id,
          },
        });
      }
    }

    // 4C. Create Condo Accounts (CBE and Telebirr)
    const cbeAccount = await prisma.condoAccount.create({
      data: {
        condoId: condo.id,
        accountName: `${cConf.condoName} Operational Treasury`,
        accountNumber: `1000${cNum}98765432`,
        paymentMethod: "cbe",
        accountType: "bank",
        providerName: "Commercial Bank of Ethiopia",
        balance: 650000.00 + cNum * 75000,
        isDefault: true,
        status: "active",
      },
    });

    const telebirrAccount = await prisma.condoAccount.create({
      data: {
        condoId: condo.id,
        accountName: `${cConf.condoName} Telebirr Revenue`,
        accountNumber: `091100000${cNum}`,
        paymentMethod: "telebirr",
        accountType: "mobile_money",
        providerName: "Ethio Telecom Telebirr",
        balance: 280000.00 + cNum * 25000,
        isDefault: false,
        status: "active",
      },
    });

    // 4D. Create Condo Admin
    fanCounter += 1n;
    const adminEmail = cNum === 1 ? "shanbeldires7@gmail.com" : `condo${cNum}_admin@yekondominium.com`;
    const adminFullName = cNum === 1 ? "Shanbel Dires" : `Condo Admin ${cNum}`;
    const condoAdmin = await prisma.user.create({
      data: {
        fullName: adminFullName,
        email: adminEmail,
        phoneNumber: `+25191100100${cNum}`,
        password: hashedPassword,
        role: "condo_admin",
        condoId: condo.id,
        condoCode: condo.condoCode,
        isVerified: true,
        fan: fanCounter.toString(),
      },
    });

    // 4E. Create Guard
    fanCounter += 1n;
    const guard = await prisma.user.create({
      data: {
        fullName: `Main Gate Security Officer ${cNum}`,
        email: `guard${cNum}@yekondominium.com`,
        phoneNumber: `+25191100200${cNum}`,
        password: hashedPassword,
        role: "guard",
        condoId: condo.id,
        condoCode: condo.condoCode,
        isVerified: true,
        fan: fanCounter.toString(),
      },
    });

    // 4F. Create 3 Residents per condo
    const residents = [];
    for (let rIdx = 1; rIdx <= 3; rIdx++) {
      fanCounter += 1n;
      const resEmail = (cNum === 1 && rIdx === 1) ? "shanbeldires6@gmail.com" : `resident_${cConf.condoCode.toLowerCase()}_${rIdx}@yekondominium.com`;
      const resName = (cNum === 1 && rIdx === 1) ? "Shanbel Dires Resident" : `Resident ${rIdx} (${cConf.condoName.split(' ')[0]})`;
      const assignedBlock = createdBlocks[rIdx % createdBlocks.length];
      const assignedRoom = `10${rIdx}`;

      const resUser = await prisma.user.create({
        data: {
          fullName: resName,
          email: resEmail,
          phoneNumber: `+251911003${cNum}${rIdx}`,
          password: hashedPassword,
          role: "resident",
          condoId: condo.id,
          condoCode: condo.condoCode,
          block: assignedBlock.blockNo,
          roomNo: assignedRoom,
          isVerified: true,
          fan: fanCounter.toString(),
          isInEqub: true,
          isInIddir: true,
        },
      });
      residents.push(resUser);

      // Create registered payout destination account for resident
      await prisma.userAccount.create({
        data: {
          userId: resUser.id,
          accountName: `${resName} Mobile Payout`,
          accountNumber: `09457922${cNum}${rIdx}`,
          paymentMethod: "telebirr",
          accountType: "mobile_money",
          providerName: "Ethio Telecom Telebirr",
          balance: 0.00,
          isDefault: true,
          status: "active",
        },
      });

      await prisma.userAccount.create({
        data: {
          userId: resUser.id,
          accountName: `${resName} Savings`,
          accountNumber: `10005544332${cNum}${rIdx}`,
          paymentMethod: "cbe",
          accountType: "bank",
          providerName: "Commercial Bank of Ethiopia",
          balance: 0.00,
          isDefault: false,
          status: "active",
        },
      });
    }

    // 4G. Create Equb Rotating Savings Group
    const equb = await prisma.equb.create({
      data: {
        name: `${cConf.condoName.split(' ')[0]} Executive Monthly Equb`,
        condoId: condo.id,
        createdById: condoAdmin.id,
        contributionAmount: 5000.00,
        noMembers: residents.length,
        startDate: new Date("2026-01-01"),
        dueDate: new Date("2026-12-31"),
        status: "active",
      },
    });

    // Enroll members into Equb
    for (let rIdx = 0; rIdx < residents.length; rIdx++) {
      const res = residents[rIdx];
      const isWinner = rIdx === 0;
      await prisma.equbMember.create({
        data: {
          equbId: equb.id,
          userId: res.id,
          condoId: condo.id,
          hasReceivedPayout: isWinner,
          payoutCount: isWinner ? 1 : 0,
          totalPaid: 10000.00,
          status: isWinner ? "winner" : "active",
        },
      });

      // Record past winner payout for first member
      if (isWinner) {
        await prisma.equbPayout.create({
          data: {
            equbId: equb.id,
            winnerId: res.id,
            createdById: condoAdmin.id,
            amount: 55000.00,
            roundNumber: 1,
            selectionReference: `HX-EQB-${cNum}01-WINNER`,
            status: "paid",
            selectedAt: new Date("2026-01-15"),
            paidAt: new Date("2026-01-16"),
          },
        });
      }
    }

    // 4H. Create Iddir Mutual Aid Association
    const iddir = await prisma.iddir.create({
      data: {
        name: `${cConf.condoName.split(' ')[0]} Resident Mutual Aid Society`,
        condoId: condo.id,
        createdById: condoAdmin.id,
        contributionAmount: 300.00,
        noMembers: residents.length,
        startedDate: new Date("2026-01-01"),
        status: "active",
      },
    });

    // Enroll members into Iddir
    for (let rIdx = 0; rIdx < residents.length; rIdx++) {
      const res = residents[rIdx];
      await prisma.iddirMember.create({
        data: {
          iddirId: iddir.id,
          userId: res.id,
          totalPaid: 1800.00,
          totalReceived: rIdx === 1 ? 7500.00 : 0.00,
          status: "active",
        },
      });

      // Add emergency claim for resident 2
      if (rIdx === 1) {
        await prisma.iddirClaim.create({
          data: {
            iddirId: iddir.id,
            userId: res.id,
            claimType: "medical_assistance",
            reason: "Emergency Outpatient Medical Bill Reimbursement",
            description: "Household hospital coverage assistance under condominium mutual aid policy guidelines.",
            amountRequested: 7500.00,
            amountApproved: 7500.00,
            status: "approved",
            reviewedById: condoAdmin.id,
            decidedAt: new Date(),
          },
        });
      }
    }

    // 4I. Create Official Announcements (Pinned emergency and general maintenance)
    await prisma.announcement.create({
      data: {
        title: `🚨 Emergency Water Maintenance Scheduled for ${cConf.condoName.split(' ')[0]}`,
        body: "Please be advised that the main municipal water booster pump in Block A will undergo routine scheduled servicing this Saturday between 9:00 AM and 1:00 PM. Backup reservoir tanks will remain operational for essential usage.",
        announcementType: "emergency",
        createdByRole: "admin",
        createdById: condoAdmin.id,
        condoId: condo.id,
        isPinned: true,
      },
    });

    await prisma.announcement.create({
      data: {
        title: `📋 Annual General Resident Assembly & Budget Approval`,
        body: "All resident unit owners and tenants are cordially invited to attend the bi-annual condominium general assembly at the community recreation center. Agenda includes security gate automation and annual auditing report.",
        announcementType: "general",
        createdByRole: "admin",
        createdById: condoAdmin.id,
        condoId: condo.id,
        isPinned: false,
      },
    });

    // 4J. Create Verified Promotions / Marketplace Listings
    await prisma.promotion.create({
      data: {
        title: `${cConf.condoName.split(' ')[0]} Artisan Bakery & Cafe`,
        description: "Fresh French baguettes, Ethiopian pastry, organic coffee, and door-to-door morning bread delivery for residents.",
        type: "shop",
        category: "food",
        price: 250.00,
        businessName: "Abyssinia Golden Bakery",
        contactNumber: "+251911778899",
        email: "bakery@abyssinia.et",
        condoId: condo.id,
        postedById: residents[0].id,
        status: "active",
        expiresAt: new Date("2027-01-01"),
      },
    });

    await prisma.promotion.create({
      data: {
        title: "Professional Home & Deep Cleaning Service",
        description: "Full apartment sanitization, upholstery steam cleaning, window washing, and move-in preparation by certified technicians.",
        type: "service",
        category: "cleaning",
        price: 1200.00,
        businessName: "Sparkle Cleaners Ltd.",
        contactNumber: "+251922334455",
        email: "contact@sparkleclean.et",
        condoId: condo.id,
        postedById: residents[1].id,
        status: "active",
        expiresAt: new Date("2027-01-01"),
      },
    });

    // 4K. Create Lost & Found Items
    await prisma.lostFound.create({
      data: {
        itemName: "Set of Silver House Keys with Leather Tag",
        description: "Found near the main lobby entrance elevator. Includes two silver front door keys and a black gate fob.",
        type: "found",
        category: "keys",
        status: "open",
        location: "Block A Ground Floor Elevator Lobby",
        condoId: condo.id,
        userId: guard.id,
        dateLostFound: new Date(),
      },
    });

    await prisma.lostFound.create({
      data: {
        itemName: "Black Leather Tri-Fold Wallet with ID Card",
        description: "Accidentally misplaced in the underground visitor parking section B near stall 24.",
        type: "lost",
        category: "documents",
        status: "claimed",
        location: "Underground Parking Lot Level -1",
        condoId: condo.id,
        userId: residents[1].id,
        dateLostFound: new Date(),
      },
    });

    // 4L. Create Reports / Incident Tickets with Responses
    const report1 = await prisma.report.create({
      data: {
        title: "Corridor Overhead Lighting Fixture Outage",
        description: "Two fluorescent LED ceiling fixtures on the 2nd floor residential walkway near unit 202 are flickering and need bulb replacement.",
        category: "electrical",
        priority: "medium",
        status: "in_progress",
        condoId: condo.id,
        reporterId: residents[0].id,
      },
    });

    await prisma.reportResponse.create({
      data: {
        reportId: report1.id,
        userId: condoAdmin.id,
        message: "Thank you for notifying building management. Maintenance team has been assigned and replacement bulbs will be installed by 3:00 PM today.",
        isAdminResponse: true,
      },
    });

    const report2 = await prisma.report.create({
      data: {
        title: "Equb Membership Application - Round 2 Participation",
        description: "Resident request to join the condominium executive rotating savings group for the remaining cycle.",
        category: "equb_membership",
        priority: "low",
        status: "approved",
        condoId: condo.id,
        reporterId: residents[1].id,
        equbId: equb.id,
      },
    });

    await prisma.reportResponse.create({
      data: {
        reportId: report2.id,
        userId: condoAdmin.id,
        message: "Your Equb participation request has been verified and approved by the management committee. Welcome to Round 2!",
        isAdminResponse: true,
      },
    });

    // 4M. Create Payments & Immutable Double-Entry Transactions
    const txRef1 = `HX-${cConf.condoCode}-PAY-001`;
    const transaction1 = await prisma.transaction.create({
      data: {
        senderId: residents[0].id,
        senderAccNo: "0945792211",
        senderName: residents[0].fullName,
        receiverCondoAccountId: cbeAccount.id,
        receiverAccNo: cbeAccount.accountNumber,
        receiverName: `${condo.condoName} (${cbeAccount.accountName})`,
        hxAccountId: hxAccount.id,
        referenceNo: txRef1,
        stamp: txRef1,
        paymentType: "service_charge",
        amount: 2508.50,
        paymentMethod: "cbe",
        gateway: "hx",
        status: "completed",
        condoId: condo.id,
      },
    });

    await prisma.payment.create({
      data: {
        userId: residents[0].id,
        condoId: condo.id,
        paymentType: "service_charge",
        amount: 2500.00,
        serviceFee: 8.50,
        totalAmount: 2508.50,
        monthYear: "2026-10",
        paymentMethod: "cbe",
        status: "approved",
        transactionId: transaction1.id,
        paymentDate: new Date(),
        approvalDate: new Date(),
        approvedById: condoAdmin.id,
        adminNotes: "Monthly condominium maintenance dues verified via bank confirmation.",
      },
    });

    await prisma.serviceFee.create({
      data: {
        transactionId: transaction1.id,
        userId: residents[0].id,
        condoId: condo.id,
        hxAccountId: hxAccount.id,
        percentage: 0.34,
        baseAmount: 2500.00,
        feeAmount: 8.50,
        status: "collected",
      },
    });

    // Second pending Equb payment
    const txRef2 = `HX-${cConf.condoCode}-PAY-002`;
    const transaction2 = await prisma.transaction.create({
      data: {
        senderId: residents[1].id,
        senderAccNo: "0945792212",
        senderName: residents[1].fullName,
        receiverCondoAccountId: telebirrAccount.id,
        receiverAccNo: telebirrAccount.accountNumber,
        receiverName: `${condo.condoName} (${telebirrAccount.accountName})`,
        hxAccountId: hxAccount.id,
        referenceNo: txRef2,
        stamp: txRef2,
        paymentType: "equb",
        amount: 5017.00,
        paymentMethod: "telebirr",
        gateway: "hx",
        status: "pending",
        condoId: condo.id,
      },
    });

    await prisma.payment.create({
      data: {
        userId: residents[1].id,
        condoId: condo.id,
        equbId: equb.id,
        paymentType: "equb",
        amount: 5000.00,
        serviceFee: 17.00,
        totalAmount: 5017.00,
        monthYear: "2026-10",
        paymentMethod: "telebirr",
        status: "pending",
        transactionId: transaction2.id,
        paymentDate: new Date(),
        adminNotes: "Pending confirmation from Telebirr gateway.",
      },
    });

    // 4N. Create Chat Messages
    await prisma.chatMessage.create({
      data: {
        senderId: residents[0].id,
        receiverId: guard.id,
        condoId: condo.id,
        content: "Hello Officer, I have a delivery coming in around 4:00 PM for unit 101. Please grant access.",
        type: "message",
        isRead: true,
      },
    });

    await prisma.chatMessage.create({
      data: {
        senderId: guard.id,
        receiverId: residents[0].id,
        condoId: condo.id,
        content: "Understood, Mr. Shanbel. I will verify the delivery driver and direct them to the block.",
        type: "message",
        isRead: true,
      },
    });

    console.log(`✔ Finished provisioning ${cConf.condoName}`);
  }

  // 5. Verification Summary
  const countCondos = await prisma.condo.count();
  const countBlocks = await prisma.block.count();
  const countRooms = await prisma.room.count();
  const countUsers = await prisma.user.count();
  const countAccounts = await prisma.condoAccount.count();
  const countEqubs = await prisma.equb.count();
  const countIddirs = await prisma.iddir.count();
  const countAnnouncements = await prisma.announcement.count();
  const countPromotions = await prisma.promotion.count();
  const countLostFound = await prisma.lostFound.count();
  const countReports = await prisma.report.count();
  const countPayments = await prisma.payment.count();
  const countTransactions = await prisma.transaction.count();

  console.log("\n=================================================================");
  console.log("🎉 SEEDING COMPLETED SUCCESSFULLY — 5 CONDOMINIUMS ACTIVE");
  console.log("=================================================================");
  console.log(`
Condominiums Created   : ${countCondos} (Bole, CMC, Sarbet, Kazanchis, Gerji)
Building Blocks        : ${countBlocks}
Apartment Rooms/Units  : ${countRooms}
Active Users           : ${countUsers} (2 Super Admins, 5 Condo Admins, 5 Guards, 15 Residents)
Condo Treasury Accounts: ${countAccounts} (CBE & Telebirr per Condominium)
Equb Groups Active     : ${countEqubs} (with members, winners, and rounds)
Iddir Societies Active : ${countIddirs} (with members and approved claims)
Announcements & Alerts : ${countAnnouncements} (pinned emergency & general notices)
Promotions Marketplace : ${countPromotions} (active advertisements)
Lost & Found Records   : ${countLostFound} (open & claimed property items)
Reports & Tickets      : ${countReports} (maintenance & join requests with staff responses)
Payments Recorded      : ${countPayments} (approved dues & pending contributions)
Transactions Audited   : ${countTransactions} (double-entry immutable ledger)
HX System Treasury     : 1 (${hxAccount.accountName} - ${hxAccount.accountNumber})
=================================================================
`);
  console.log("🔐 DEFAULT LOGIN CREDENTIALS");
  console.log("=================================================================");
  console.log(`
👑 Super Administrator:
  Email   : superadmin@yekondominium.com
  Email 2 : shanbeldires00@gmail.com
  Password: ${DEFAULT_PASSWORD}

🏢 Condominium 1 Admin (Bole):
  Email   : shanbeldires7@gmail.com
  Password: ${DEFAULT_PASSWORD}

🏢 Condominium 2 Admin (CMC):
  Email   : condo2_admin@yekondominium.com
  Password: ${DEFAULT_PASSWORD}

🏡 Resident 1 (Bole - Unit 101):
  Email   : shanbeldires6@gmail.com
  Password: ${DEFAULT_PASSWORD}

👮 Security Guard (Bole):
  Email   : guard1@yekondominium.com
  Password: ${DEFAULT_PASSWORD}
=================================================================\n`);
}

main()
  .catch((error) => {
    console.error("\n❌ SEEDING FAILED\n", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
