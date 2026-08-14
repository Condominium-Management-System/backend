import { prisma } from "../config/prisma.config.js";
import AppError from "../errorhandler/AppError.js";

import {
  createEqubValidation,
  updateEqubValidation,
  addEqubMemberValidation,
  updateEqubMemberValidation,
} from "../inputValidation/equb.validation.js";


// CREATE EQUb

export const createEqubService = async (
  requester,
  payload
) => {

  const { error, value } =
    createEqubValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }

  const {
    condoId,
    name,
    contributionAmount,
    startDate,
    dueDate,
  } = value;


  // ----------------------------------------------------
  // CHECK REQUESTER
  // ----------------------------------------------------

  const admin = await prisma.user.findUnique({
    where: {
      id: String(requester.id),
    },
  });

  if (!admin) {
    throw new AppError(
      "User not found",
      404
    );
  }


  if (
    admin.role !== "super_admin" &&
    admin.role !== "condo_admin"
  ) {
    throw new AppError(
      "Only administrators can create an Equb",
      403
    );
  }


  // ----------------------------------------------------
  // CHECK CONDO
  // ----------------------------------------------------

  const condo = await prisma.condo.findUnique({
    where: {
      id: condoId,
    },
  });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }


  if (!condo.activeStatus) {
    throw new AppError(
      "Condominium is inactive",
      400
    );
  }


  // ----------------------------------------------------
  // CONDO ADMIN ACCESS
  // ----------------------------------------------------

  if (
    admin.role === "condo_admin" &&
    admin.condoId !== condo.id
  ) {
    throw new AppError(
      "You cannot manage Equbs in another condominium",
      403
    );
  }


  // ----------------------------------------------------
  // DATE VALIDATION
  // ----------------------------------------------------

  const start = new Date(startDate);
  const due = new Date(dueDate);

  if (due <= start) {
    throw new AppError(
      "Due date must be after start date",
      400
    );
  }


  // ----------------------------------------------------
  // CREATE
  // ----------------------------------------------------

  const equb = await prisma.equb.create({
    data: {
      condoId: condo.id,

      createdById: admin.id,

      name: name.trim(),

      noMembers: 0,

      members: [],

      status: "pending",

      startDate: start,

      dueDate: due,

      contributionAmount,
    },

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },
    },
  });


  return equb;
};


// GET ALL EQUBS

export const getAllEqubsService = async (
  requester
) => {

  const where = {
    deletedAt: null,
  };


  // Condo admin only sees own condo

  if (
    requester.role === "condo_admin"
  ) {
    where.condoId = requester.condoId;
  }


  return prisma.equb.findMany({
    where,

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },

      members: {
        where: {
          status: "active",
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
      },

      winners: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};


// GET EQUB BY ID

export const getEqubByIdService = async (
  requester,
  equbId
) => {

  const equb = await prisma.equb.findFirst({
    where: {
      id: String(equbId),
      deletedAt: null,
    },

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
        },
      },

      createdBy: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        },
      },

      members: {
        where: {
          status: "active",
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
              condoId: true,
              condoCode: true,
            },
          },
        },
      },

      winners: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
      },
    },
  });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot access this Equb",
      403
    );
  }


  return equb;
};


// UPDATE EQUB

export const updateEqubService = async (
  requester,
  equbId,
  payload
) => {

  const { error, value } =
    updateEqubValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const equb =
    await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  // ----------------------------------------------------
  // ACCESS
  // ----------------------------------------------------

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot update this Equb",
      403
    );
  }


  const data = {};


  if (value.name !== undefined) {
    data.name = value.name.trim();
  }


  if (
    value.contributionAmount !== undefined
  ) {
    data.contributionAmount =
      value.contributionAmount;
  }


  if (value.startDate !== undefined) {
    data.startDate =
      new Date(value.startDate);
  }


  if (value.dueDate !== undefined) {
    data.dueDate =
      new Date(value.dueDate);
  }


  if (
    data.startDate &&
    data.dueDate &&
    data.dueDate <= data.startDate
  ) {
    throw new AppError(
      "Due date must be after start date",
      400
    );
  }


  if (value.status !== undefined) {
    data.status = value.status;
  }


  return prisma.equb.update({
    where: {
      id: equb.id,
    },

    data,

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
        },
      },
    },
  });
};


// DELETE EQUB

export const deleteEqubService = async (
  requester,
  equbId
) => {

  const equb =
    await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot delete this Equb",
      403
    );
  }


  return prisma.equb.update({
    where: {
      id: equb.id,
    },

    data: {
      deletedAt: new Date(),
      status: "cancelled",
    },
  });
};


// ADD USER TO EQUB

export const addEqubMemberService = async (
  requester,
  equbId,
  payload
) => {

  const { error, value } =
    addEqubMemberValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const equb =
    await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot manage this Equb",
      403
    );
  }


  // ----------------------------------------------------
  // USER
  // ----------------------------------------------------

  const user =
    await prisma.user.findUnique({
      where: {
        id: value.userId,
      },
    });


  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }


  if (user.condoId !== equb.condoId) {
    throw new AppError(
      "User does not belong to this condominium",
      403
    );
  }


  // ----------------------------------------------------
  // CHECK EXISTING MEMBERSHIP
  // ----------------------------------------------------

  const existing =
    await prisma.equbMember.findUnique({
      where: {
        equbId_userId: {
          equbId: equb.id,
          userId: user.id,
        },
      },
    });


  if (existing) {

    if (
      existing.status === "active"
    ) {
      throw new AppError(
        "User is already a member of this Equb",
        409
      );
    }


    const member =
      await prisma.equbMember.update({
        where: {
          id: existing.id,
        },

        data: {
          status: "active",
          joinedAt: new Date(),
          leftAt: null,
        },
      });


    await updateEqubMemberCount(
      equb.id
    );

    return member;
  }


  const member =
    await prisma.equbMember.create({
      data: {
        equbId: equb.id,
        userId: user.id,
        status: "active",
        joinedAt: new Date(),
      },
    });


  await updateEqubMemberCount(
    equb.id
  );


  return member;
};


// REMOVE USER FROM EQUB

export const removeEqubMemberService = async (
  requester,
  equbId,
  userId
) => {

  const equb =
    await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot manage this Equb",
      403
    );
  }


  const member =
    await prisma.equbMember.findUnique({
      where: {
        equbId_userId: {
          equbId: equb.id,
          userId: String(userId),
        },
      },
    });


  if (!member) {
    throw new AppError(
      "User is not a member of this Equb",
      404
    );
  }


  const updated =
    await prisma.equbMember.update({
      where: {
        id: member.id,
      },

      data: {
        status: "removed",
        leftAt: new Date(),
      },
    });


  await updateEqubMemberCount(
    equb.id
  );


  return updated;
};


// UPDATE MEMBER STATUS

export const updateEqubMemberService = async (
  requester,
  equbId,
  userId,
  payload
) => {

  const { error, value } =
    updateEqubMemberValidation.validate(
      payload
    );

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const equb =
    await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot manage this Equb",
      403
    );
  }


  const member =
    await prisma.equbMember.findUnique({
      where: {
        equbId_userId: {
          equbId: equb.id,
          userId: String(userId),
        },
      },
    });


  if (!member) {
    throw new AppError(
      "Equb member not found",
      404
    );
  }


  const updated =
    await prisma.equbMember.update({
      where: {
        id: member.id,
      },

      data: {
        status: value.status,

        leftAt:
          value.status === "active"
            ? null
            : new Date(),
      },
    });


  await updateEqubMemberCount(
    equb.id
  );


  return updated;
};


// GET EQUB MEMBERS

export const getEqubMembersService = async (
  requester,
  equbId
) => {

  const equb =
    await prisma.equb.findFirst({
      where: {
        id: String(equbId),
        deletedAt: null,
      },
    });


  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }


  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot access this Equb",
      403
    );
  }


  return prisma.equbMember.findMany({
    where: {
      equbId: equb.id,
      status: "active",
    },

    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          fan: true,
          condoId: true,
          condoCode: true,
        },
      },
    },

    orderBy: {
      joinedAt: "asc",
    },
  });
};


// RANDOM WINNER

export const selectEqubWinnerService = async (
  requester,
  equbId
) => {

  // ----------------------------------------------------
  // FIND EQUb
  // ----------------------------------------------------

  const equb = await prisma.equb.findFirst({
    where: {
      id: String(equbId),
      deletedAt: null,
    },

    include: {
      members: {
        where: {
          status: "active",
          hasReceivedPayout: false,
        },

        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phoneNumber: true,
              fan: true,
            },
          },
        },
      },
    },
  });

  if (!equb) {
    throw new AppError(
      "Equb not found",
      404
    );
  }

  // ----------------------------------------------------
  // AUTHORIZATION
  // ----------------------------------------------------

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== equb.condoId
  ) {
    throw new AppError(
      "You cannot select a winner for this Equb",
      403
    );
  }

  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "Only admin can select an Equb winner",
      403
    );
  }

  // ----------------------------------------------------
  // CHECK EQUb STATUS
  // ----------------------------------------------------

  if (equb.status !== "active") {
    throw new AppError(
      "Only an active Equb can select a winner",
      400
    );
  }

  // ----------------------------------------------------
  // CHECK MEMBERS
  // ----------------------------------------------------

  if (equb.members.length === 0) {
    throw new AppError(
      "Equb has no eligible members",
      400
    );
  }

  // ----------------------------------------------------
  // CHECK WHETHER ALL MEMBERS HAVE PAID
  // ----------------------------------------------------

  const contributionAmount =
    Number(equb.contributionAmount);

  const membersCount =
    equb.members.length;

  const expectedTotal =
    contributionAmount * membersCount;

  // ----------------------------------------------------
  // RANDOM WINNER
  // ----------------------------------------------------

  const randomIndex = Math.floor(
    Math.random() * membersCount
  );

  const selectedMember =
    equb.members[randomIndex];

  // ----------------------------------------------------
  // GENERATE ROUND NUMBER
  // ----------------------------------------------------

  const previousPayouts =
    await prisma.equbPayout.count({
      where: {
        equbId: equb.id,
      },
    });

  const roundNumber =
    previousPayouts + 1;

  // ----------------------------------------------------
  // SELECTION REFERENCE
  // ----------------------------------------------------

  const selectionReference =
    `EQB-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase()}`;

  // ----------------------------------------------------
  // CREATE PAYOUT
  // ----------------------------------------------------

  const payout =
    await prisma.equbPayout.create({
      data: {
        equbId: equb.id,

        winnerId:
          selectedMember.userId,

        createdById:
          requester.id,

        // TOTAL MONEY COLLECTED
        amount:
          expectedTotal,

        roundNumber,

        selectionReference,

        status: "selected",

        selectedAt:
          new Date(),
      },

      include: {
        winner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            fan: true,
          },
        },

        equb: {
          select: {
            id: true,
            name: true,
            contributionAmount: true,
          },
        },
      },
    });

  return {
    payoutId: payout.id,

    selectionReference:
      payout.selectionReference,

    roundNumber:
      payout.roundNumber,

    equb: {
      id: payout.equb.id,
      name: payout.equb.name,
    },

    contributionPerMember:
      contributionAmount,

    totalMembers:
      membersCount,

    totalAmountCollected:
      expectedTotal,

    winner: payout.winner,

    amountWinnerWillReceive:
      expectedTotal,

    status:
      payout.status,

    selectedAt:
      payout.selectedAt,
  };
}


// HELPER

const updateEqubMemberCount = async (
  equbId
) => {

  const count =
    await prisma.equbMember.count({
      where: {
        equbId,
        status: "active",
      },
    });


  return prisma.equb.update({
    where: {
      id: equbId,
    },

    data: {
      noMembers: count,
    },
  });
};