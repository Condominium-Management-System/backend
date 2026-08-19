import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  createBlockValidation,
  updateBlockValidation
} from "../inputValidation/block.validation.js";


// HELPERS

const PUBLIC_CONDO_SELECT = {
  id: true,
  condoCode: true,
  condoName: true,
  address: true,
  city: true
};


// Check authenticated admin access to a condominium
const checkCondoAccess = (requester, condoId) => {

  if (!requester) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  // Super admin can access every condominium
  if (requester.role === "super_admin") {
    return;
  }

  // Condo admin can access only own condominium
  if (requester.role === "condo_admin") {

    if (!requester.condoId) {
      throw new AppError(
        "Your account is not assigned to a condominium",
        403
      );
    }

    if (requester.condoId !== condoId) {
      throw new AppError(
        "You can only access your own condominium",
        403
      );
    }

    return;
  }

  throw new AppError(
    "You do not have permission to access condominium management data",
    403
  );
};


// Validate condominium for public access
const getPublicCondo = async (condoId) => {

  if (!condoId) {
    throw new AppError(
      "Condominium ID is required",
      400
    );
  }

  const condo = await prisma.condo.findFirst({
    where: {
      id: String(condoId),
      activeStatus: true,
      deletedAt: null
    },

    select: {
      id: true,
      condoCode: true,
      condoName: true,
      address: true,
      city: true,
      gpsCoordinates: true,
      activeStatus: true
    }
  });

  if (!condo) {
    throw new AppError(
      "Active condominium not found",
      404
    );
  }

  return condo;
};


// CREATE BLOCK
// ADMIN ONLY

export const createBlockService = async (
  payload,
  requester
) => {

  const {
    error,
    value
  } = createBlockValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details
        .map((d) => d.message)
        .join(", "),
      400
    );
  }

  const {
    condoId,
    blockNo,
    noRooms,
    noFloors
  } = value;


  // Check authenticated access
  checkCondoAccess(
    requester,
    condoId
  );


  // Check condominium
  const condo =
    await prisma.condo.findFirst({
      where: {
        id: condoId,
        deletedAt: null
      }
    });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }


  // Check duplicate block
  const existingBlock =
    await prisma.block.findFirst({
      where: {
        condoId,
        blockNo,
        deletedAt: null
      }
    });

  if (existingBlock) {
    throw new AppError(
      "Block number already exists in this condominium",
      409
    );
  }


  // Create block
  const block =
    await prisma.block.create({
      data: {
        condoId,
        blockNo,
        noRooms,
        noFloors
      },

      include: {
        condo: {
          select: PUBLIC_CONDO_SELECT
        },

        _count: {
          select: {
            rooms: true
          }
        }
      }
    });


  return {
    id: block.id,
    condoId: block.condoId,
    blockNo: block.blockNo,
    noRooms: block.noRooms,
    noFloors: block.noFloors,

    rooms: {
      configured: block.noRooms,
      created: block._count.rooms
    },

    condo: block.condo,

    createdAt: block.createdAt,
    updatedAt: block.updatedAt
  };
};


// PUBLIC BLOCK LIST BY CONDO
//
// GET /api/condos/:condoId/blocks
//
// NO AUTHENTICATION
//
// Only limited public information is returned.

export const getPublicBlocksByCondoService =
  async (condoId, filters = {}) => {

    const condo =
      await getPublicCondo(condoId);


    const where = {
      condoId: condo.id,
      deletedAt: null
    };


    // Optional block number filter
    if (filters.blockNo) {

      where.blockNo = {
        contains:
          String(filters.blockNo).trim(),

        mode: "insensitive"
      };

    }


    const blocks =
      await prisma.block.findMany({

        where,

        orderBy: [
          {
            blockNo: "asc"
          }
        ],

        select: {
          id: true,
          blockNo: true,
          noRooms: true,
          noFloors: true,

          rooms: {
            where: {
              deletedAt: null
            },

            select: {
              status: true
            }
          }
        }
      });


    return {
      condo: {
        id: condo.id,
        condoCode: condo.condoCode,
        condoName: condo.condoName,
        address: condo.address,
        city: condo.city,
        gpsCoordinates:
          condo.gpsCoordinates
      },

      blocks: blocks.map((block) => {

        const totalRooms =
          block.rooms.length;

        const freeRooms =
          block.rooms.filter(
            (room) =>
              room.status === "free"
          ).length;

        const occupiedRooms =
          block.rooms.filter(
            (room) =>
              room.status === "occupied"
          ).length;

        const reservedRooms =
          block.rooms.filter(
            (room) =>
              room.status === "reserved"
          ).length;


        return {
          id: block.id,
          blockNo: block.blockNo,

          configuredRooms:
            block.noRooms,

          totalRooms,

          noFloors:
            block.noFloors,

          rooms: {
            total: totalRooms,
            free: freeRooms,
            occupied: occupiedRooms,
            reserved: reservedRooms
          },

          availableRooms:
            freeRooms,

          occupancyRate:
            totalRooms === 0
              ? 0
              : Number(
                  (
                    (occupiedRooms /
                      totalRooms) *
                    100
                  ).toFixed(2)
                )
        };

      })
    };
  };


// PUBLIC SINGLE BLOCK
//
// GET /api/condos/:condoId/blocks/:blockId

export const getPublicBlockByIdService =
  async (
    condoId,
    blockId
  ) => {

    const condo =
      await getPublicCondo(condoId);


    const block =
      await prisma.block.findFirst({

        where: {
          id: String(blockId),
          condoId: condo.id,
          deletedAt: null
        },

        select: {
          id: true,
          blockNo: true,
          noRooms: true,
          noFloors: true,

          rooms: {
            where: {
              deletedAt: null
            },

            select: {
              status: true
            }
          }
        }
      });


    if (!block) {
      throw new AppError(
        "Block not found in this condominium",
        404
      );
    }


    const totalRooms =
      block.rooms.length;

    const freeRooms =
      block.rooms.filter(
        (room) =>
          room.status === "free"
      ).length;

    const occupiedRooms =
      block.rooms.filter(
        (room) =>
          room.status === "occupied"
      ).length;

    const reservedRooms =
      block.rooms.filter(
        (room) =>
          room.status === "reserved"
      ).length;


    return {
      condo: {
        id: condo.id,
        condoCode: condo.condoCode,
        condoName: condo.condoName,
        address: condo.address,
        city: condo.city
      },

      block: {
        id: block.id,
        blockNo: block.blockNo,
        noFloors: block.noFloors,

        configuredRooms:
          block.noRooms,

        rooms: {
          total: totalRooms,
          free: freeRooms,
          occupied: occupiedRooms,
          reserved: reservedRooms
        },

        availableRooms:
          freeRooms,

        occupancyRate:
          totalRooms === 0
            ? 0
            : Number(
                (
                  (occupiedRooms /
                    totalRooms) *
                  100
                ).toFixed(2)
              )
      }
    };
  };


// PUBLIC SEARCH ALL BLOCKS
//
// GET /api/blocks/search
//
// No authentication.
//
// Example:
// /api/blocks/search?search=B1
// /api/blocks/search?search=YEKONDO-001
// /api/blocks/search?search=Bole
// /api/blocks/search?condoId=UUID

export const searchBlocksService = async (
  search,
  filters = {}
) => {

  const term =
    search?.trim() || "";


  const where = {
    deletedAt: null,

    condo: {
      activeStatus: true,
      deletedAt: null
    }
  };


  // Optional condominium scope
  if (filters.condoId) {

    where.condoId =
      String(filters.condoId);

  }


  // Search block + condominium information
  if (term) {

    const numericTerm =
      Number(term);


    const searchConditions = [

      {
        blockNo: {
          contains: term,
          mode: "insensitive"
        }
      },

      {
        condo: {
          condoName: {
            contains: term,
            mode: "insensitive"
          }
        }
      },

      {
        condo: {
          condoCode: {
            contains: term,
            mode: "insensitive"
          }
        }
      },

      {
        condo: {
          address: {
            contains: term,
            mode: "insensitive"
          }
        }
      },

      {
        condo: {
          city: {
            contains: term,
            mode: "insensitive"
          }
        }
      }

    ];


    // Only add floor search when numeric
    if (
      !Number.isNaN(numericTerm)
    ) {

      searchConditions.push({
        noFloors: numericTerm
      });

    }


    where.OR =
      searchConditions;
  }


  const blocks =
    await prisma.block.findMany({

      where,

      orderBy: {
        createdAt: "desc"
      },

      select: {
        id: true,
        blockNo: true,
        noRooms: true,
        noFloors: true,

        condo: {
          select: {
            id: true,
            condoCode: true,
            condoName: true,
            address: true,
            city: true
          }
        },

        rooms: {
          where: {
            deletedAt: null
          },

          select: {
            status: true
          }
        }
      }
    });


  return blocks.map((block) => {

    const totalRooms =
      block.rooms.length;

    const freeRooms =
      block.rooms.filter(
        (room) =>
          room.status === "free"
      ).length;

    const occupiedRooms =
      block.rooms.filter(
        (room) =>
          room.status === "occupied"
      ).length;

    const reservedRooms =
      block.rooms.filter(
        (room) =>
          room.status === "reserved"
      ).length;


    return {

      id: block.id,

      blockNo:
        block.blockNo,

      configuredRooms:
        block.noRooms,

      totalRooms,

      noFloors:
        block.noFloors,

      availableRooms:
        freeRooms,

      rooms: {
        total: totalRooms,
        free: freeRooms,
        occupied: occupiedRooms,
        reserved: reservedRooms
      },

      occupancyRate:
        totalRooms === 0
          ? 0
          : Number(
              (
                (occupiedRooms /
                  totalRooms) *
                100
              ).toFixed(2)
            ),

      condo:
        block.condo
    };

  });
};


// ADMIN GET ALL BLOCKS
//
// GET /api/blocks
//
// SUPER ADMIN:
//   Can see all condos.
//
// CONDO ADMIN:
//   Can only see own condo.
//
// Optional:
// ?condoId=UUID

export const getAllBlocksService = async ({
  condoId,
  requester
} = {}) => {

  if (!requester) {
    throw new AppError(
      "Authentication required",
      401
    );
  }


  const where = {
    deletedAt: null
  };


  // SUPER ADMIN
  if (
    requester.role === "super_admin"
  ) {

    if (condoId) {
      where.condoId =
        String(condoId);
    }

  }


  // CONDO ADMIN
  else if (
    requester.role === "condo_admin"
  ) {

    if (!requester.condoId) {
      throw new AppError(
        "Your account is not assigned to a condominium",
        403
      );
    }


    if (
      condoId &&
      String(condoId) !==
        String(requester.condoId)
    ) {

      throw new AppError(
        "You can only access blocks from your own condominium",
        403
      );

    }


    where.condoId =
      requester.condoId;

  }


  else {

    throw new AppError(
      "You do not have permission to access blocks",
      403
    );

  }


  return prisma.block.findMany({

    where,

    orderBy: {
      createdAt: "desc"
    },

    include: {

      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
          address: true,
          city: true
        }
      },

      _count: {
        select: {
          rooms: {
            where: {
              deletedAt: null
            }
          }
        }
      }

    }

  });
};


// ADMIN GET ONE BLOCK

export const getBlockByIdService = async (
  condoId,
  blockId,
  requester
) => {
  checkCondoAccess(
    requester,
    String(condoId)
  );

  const block = await prisma.block.findFirst({
    where: {
      id: String(blockId),
      condoId: String(condoId),
      deletedAt: null
    },

    include: {
      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
          address: true,
          city: true
        }
      },

      _count: {
        select: {
          rooms: {
            where: {
              deletedAt: null
            }
          }
        }
      }
    }
  });

  if (!block) {
    throw new AppError(
      "Block not found in this condominium",
      404
    );
  }

  return block;
};


// ADMIN BLOCK STATISTICS

export const getBlockStatisticsService = async (
  condoId,
  blockId,
  requester
) => {
  checkCondoAccess(
    requester,
    String(condoId)
  );

  const block =
    await prisma.block.findFirst({
      where: {
        id: String(blockId),
        condoId: String(condoId),
        deletedAt: null
      }
    });

  if (!block) {
    throw new AppError(
      "Block not found in this condominium",
      404
    );
  }

  const [
    totalRooms,
    freeRooms,
    occupiedRooms,
    reservedRooms
  ] = await Promise.all([
    prisma.room.count({
      where: {
        blockId: block.id,
        deletedAt: null
      }
    }),

    prisma.room.count({
      where: {
        blockId: block.id,
        status: "free",
        deletedAt: null
      }
    }),

    prisma.room.count({
      where: {
        blockId: block.id,
        status: "occupied",
        deletedAt: null
      }
    }),

    prisma.room.count({
      where: {
        blockId: block.id,
        status: "reserved",
        deletedAt: null
      }
    })
  ]);

  const occupancyRate =
    totalRooms === 0
      ? 0
      : Number(
          (
            (occupiedRooms / totalRooms) *
            100
          ).toFixed(2)
        );

  const configuredRooms = block.noRooms;

  const unconfiguredRooms = Math.max(
    configuredRooms - totalRooms,
    0
  );

  return {
    block: {
      id: block.id,
      blockNo: block.blockNo,
      noRooms: block.noRooms,
      noFloors: block.noFloors,
      condoId: block.condoId
    },

    rooms: {
      configured: configuredRooms,
      created: totalRooms,
      unconfigured: unconfiguredRooms,
      total: totalRooms,
      free: freeRooms,
      occupied: occupiedRooms,
      reserved: reservedRooms
    },

    occupancyRate
  };
};


// UPDATE BLOCK

export const updateBlockService = async (
  blockId,
  payload,
  requester
) => {

  const {
    error,
    value
  } =
    updateBlockValidation.validate(
      payload
    );


  if (error) {

    throw new AppError(
      error.details
        .map((d) => d.message)
        .join(", "),
      400
    );

  }


  const block =
    await prisma.block.findFirst({

      where: {
        id: String(blockId),
        deletedAt: null
      }

    });


  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }


  checkCondoAccess(
    requester,
    block.condoId
  );


  const data = {};


  // BLOCK NUMBER
  if (
    value.blockNo !== undefined
  ) {

    if (
      value.blockNo !==
      block.blockNo
    ) {

      const existingBlock =
        await prisma.block.findFirst({

          where: {
            condoId:
              block.condoId,

            blockNo:
              value.blockNo,

            deletedAt: null,

            id: {
              not: block.id
            }

          }

        });


      if (existingBlock) {

        throw new AppError(
          "Block number already exists in this condominium",
          409
        );

      }

    }


    data.blockNo =
      value.blockNo;

  }


  // NUMBER OF ROOMS
  if (
    value.noRooms !== undefined
  ) {

    const existingRooms =
      await prisma.room.count({

        where: {
          blockId:
            block.id,

          deletedAt: null
        }

      });


    if (
      value.noRooms <
      existingRooms
    ) {

      throw new AppError(

        `Number of rooms cannot be less than existing rooms (${existingRooms})`,

        400

      );

    }


    data.noRooms =
      value.noRooms;

  }


  // NUMBER OF FLOORS
  if (
    value.noFloors !== undefined
  ) {

    // Verify existing rooms
    const highestFloor =
      await prisma.room.findFirst({

        where: {
          blockId:
            block.id,

          deletedAt: null
        },

        orderBy: {
          floorNo: "desc"
        },

        select: {
          floorNo: true
        }

      });


    if (
      highestFloor &&
      value.noFloors <
        highestFloor.floorNo
    ) {

      throw new AppError(

        `Number of floors cannot be less than the highest existing room floor (${highestFloor.floorNo})`,

        400

      );

    }


    data.noFloors =
      value.noFloors;

  }


  if (
    Object.keys(data).length === 0
  ) {

    throw new AppError(
      "No valid information was provided",
      400
    );

  }


  return prisma.block.update({

    where: {
      id: block.id
    },

    data,

    include: {

      condo: {
        select: {
          id: true,
          condoCode: true,
          condoName: true,
          address: true,
          city: true
        }
      },

      _count: {
        select: {
          rooms: true
        }
      }

    }

  });
};


// DELETE BLOCK

export const deleteBlockService = async (
  blockId,
  requester
) => {

  const block =
    await prisma.block.findFirst({

      where: {
        id: String(blockId),
        deletedAt: null
      }

    });


  if (!block) {
    throw new AppError(
      "Block not found",
      404
    );
  }


  checkCondoAccess(
    requester,
    block.condoId
  );


  // Cannot delete block containing rooms
  const roomCount =
    await prisma.room.count({

      where: {
        blockId: block.id,
        deletedAt: null
      }

    });


  if (roomCount > 0) {

    throw new AppError(
      "Cannot delete a block that contains rooms",
      409
    );

  }


  await prisma.block.update({

    where: {
      id: block.id
    },

    data: {
      deletedAt:
        new Date()
    }

  });


  return {
    deleted: true
  };
};