import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  roomValidation,
  updateRoomSchema,
  updateRoomStatusSchema
} from "../inputValidation/room.validation.js";

const adminRoomSelect = {
  id: true,
  condoId: true,
  blockId: true,
  roomNo: true,
  floorNo: true,
  price: true,
  model: true,
  status: true,
  occupiedById: true,
  createdAt: true,
  updatedAt: true,

  condo: {
    select: {
      id: true,
      condoCode: true,
      condoName: true
    }
  },

  block: {
    select: {
      id: true,
      blockNo: true,
      noRooms: true,
      noFloors: true
    }
  },

  occupiedBy: {
    select: {
      id: true,
      fullName: true,
      email: true,
      phoneNumber: true
    }
  }
};

const publicRoomSelect = {
  id: true,
  roomNo: true,
  floorNo: true,
  model: true,
  status: true,

  block: {
    select: {
      id: true,
      blockNo: true
    }
  }
};

// CHECK CONDO ACCESS
const checkCondoAccess = (
  requester,
  condoId = null
) => {
  if (!requester) {
    throw new AppError(
      "Authentication required",
      401
    );
  }

  if (
    requester.role === "super_admin"
  ) {
    return;
  }

  if (
    requester.role === "condo_admin"
  ) {
    if (!requester.condoId) {
      throw new AppError(
        "Your account is not assigned to a condominium",
        403
      );
    }

    if (!condoId) {
      return;
    }

    if (
      String(requester.condoId) !==
      String(condoId)
    ) {
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

// VALIDATE CONDO
const validateCondo = async (
  condoId
) => {
  const condo =
    await prisma.condo.findFirst({
      where: {
        id: String(condoId),
        deletedAt: null
      }
    });

  if (!condo) {
    throw new AppError(
      "Condominium not found",
      404
    );
  }

  return condo;
};

// CREATE ROOM
export const createRoomService =
  async (
    condoId,
    payload,
    requester
  ) => {
    checkCondoAccess(
      requester,
      condoId
    );

    const {
      error,
      value
    } = roomValidation.validate({
      ...payload,
      condoId
    });

    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }

    await validateCondo(condoId);

    const block =
      await prisma.block.findFirst({
        where: {
          id: value.blockId,
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

    if (
      value.floorNo > block.noFloors
    ) {
      throw new AppError(
        "Room floor cannot exceed block floors",
        400
      );
    }

    const existingRoom =
      await prisma.room.findFirst({
        where: {
          blockId: block.id,
          roomNo: value.roomNo,
          deletedAt: null
        }
      });

    if (existingRoom) {
      throw new AppError(
        "Room number already exists in this block",
        409
      );
    }

    return prisma.room.create({
      data: {
        condoId: String(condoId),
        blockId: value.blockId,
        roomNo: value.roomNo,
        floorNo: value.floorNo,
        price: value.price,
        model: value.model,
        status: "free"
      },
      select: adminRoomSelect
    });
  };

// GET PUBLIC ROOMS
export const getPublicRoomsService =
  async ({
    condoId,
    blockId,
    status,
    search,
    floorNo,
    model
  } = {}) => {
    const where = {
      deletedAt: null
    };

    if (condoId) {
      await validateCondo(condoId);

      where.condoId =
        String(condoId);
    }

    if (blockId) {
      const block =
        await prisma.block.findFirst({
          where: {
            id: String(blockId),

            ...(condoId
              ? {
                  condoId:
                    String(condoId)
                }
              : {}),

            deletedAt: null
          }
        });

      if (!block) {
        throw new AppError(
          "Block not found",
          404
        );
      }

      where.blockId =
        String(blockId);
    }

    if (status) {
      if (
        ![
          "free",
          "occupied",
          "reserved"
        ].includes(status)
      ) {
        throw new AppError(
          "Invalid room status",
          400
        );
      }

      where.status = status;
    }

    if (floorNo !== undefined) {
      const floor =
        Number(floorNo);

      if (
        !Number.isInteger(floor) ||
        floor < 1
      ) {
        throw new AppError(
          "Invalid floor number",
          400
        );
      }

      where.floorNo = floor;
    }

    if (model) {
      if (
        ![
          "studio",
          "one_bedroom",
          "two_bedroom",
          "three_bedroom"
        ].includes(model)
      ) {
        throw new AppError(
          "Invalid room model",
          400
        );
      }

      where.model = model;
    }

    if (
      search &&
      search.trim()
    ) {
      const keyword =
        search.trim();

      const searchNumber =
        Number(keyword);

      where.OR = [
        {
          roomNo: {
            contains: keyword,
            mode: "insensitive"
          }
        },

        {
          block: {
            blockNo: {
              contains: keyword,
              mode: "insensitive"
            }
          }
        }
      ];

      if (
        Number.isInteger(
          searchNumber
        )
      ) {
        where.OR.push({
          floorNo:
            searchNumber
        });
      }
    }

    return prisma.room.findMany({
      where,
      select: publicRoomSelect,
      orderBy: [
        {
          blockId: "asc"
        },
        {
          floorNo: "asc"
        },
        {
          roomNo: "asc"
        }
      ]
    });
  };

// GET PUBLIC ROOM BY ID
export const getPublicRoomByIdService =
  async (
    roomId
  ) => {
    const room =
      await prisma.room.findFirst({
        where: {
          id: String(roomId),
          deletedAt: null
        },
        select: publicRoomSelect
      });

    if (!room) {
      throw new AppError(
        "Room not found",
        404
      );
    }

    return room;
  };

// GET PUBLIC ROOM STATISTICS
export const getPublicRoomStatisticsService =
  async (
    blockId
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

    const [
      total,
      free,
      occupied,
      reserved
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

    return {
      block: {
        id: block.id,
        blockNo: block.blockNo,
        floors: block.noFloors
      },

      rooms: {
        total,
        free,
        occupied,
        reserved
      }
    };
  };

// GET ALL ADMIN ROOMS
export const getAllRoomsService =
  async ({
    condoId = null,
    blockId,
    status,
    requester
  }) => {
    checkCondoAccess(
      requester,
      condoId
    );

    const where = {
      deletedAt: null
    };

    if (condoId) {
      await validateCondo(condoId);

      where.condoId =
        String(condoId);
    } else if (
      requester.role ===
      "condo_admin"
    ) {
      where.condoId =
        String(requester.condoId);
    }

    if (blockId) {
      const block =
        await prisma.block.findFirst({
          where: {
            id: String(blockId),

            ...(where.condoId
              ? {
                  condoId:
                    String(
                      where.condoId
                    )
                }
              : {}),

            deletedAt: null
          }
        });

      if (!block) {
        throw new AppError(
          "Block not found",
          404
        );
      }

      where.blockId =
        String(blockId);
    }

    if (status) {
      if (
        ![
          "free",
          "occupied",
          "reserved"
        ].includes(status)
      ) {
        throw new AppError(
          "Invalid room status",
          400
        );
      }

      where.status = status;
    }

    return prisma.room.findMany({
      where,
      select: adminRoomSelect,
      orderBy: [
        {
          blockId: "asc"
        },
        {
          floorNo: "asc"
        },
        {
          roomNo: "asc"
        }
      ]
    });
  };

// SEARCH ADMIN ROOMS
export const getAllRoomsServiceBySearch =
  async ({
    condoId = null,
    blockId,
    status,
    search,
    requester
  }) => {
    checkCondoAccess(
      requester,
      condoId
    );

    const where = {
      deletedAt: null
    };

    if (condoId) {
      await validateCondo(condoId);

      where.condoId =
        String(condoId);
    } else if (
      requester.role ===
      "condo_admin"
    ) {
      where.condoId =
        String(requester.condoId);
    }

    if (blockId) {
      const block =
        await prisma.block.findFirst({
          where: {
            id: String(blockId),

            ...(where.condoId
              ? {
                  condoId:
                    String(
                      where.condoId
                    )
                }
              : {}),

            deletedAt: null
          }
        });

      if (!block) {
        throw new AppError(
          "Block not found",
          404
        );
      }

      where.blockId =
        String(blockId);
    }

    if (status) {
      if (
        ![
          "free",
          "occupied",
          "reserved"
        ].includes(status)
      ) {
        throw new AppError(
          "Invalid room status",
          400
        );
      }

      where.status = status;
    }

    if (
      search &&
      search.trim()
    ) {
      const keyword =
        search.trim();

      const searchNumber =
        Number(keyword);

      where.OR = [
        {
          roomNo: {
            contains: keyword,
            mode: "insensitive"
          }
        },

        {
          block: {
            blockNo: {
              contains: keyword,
              mode: "insensitive"
            }
          }
        },

        {
          condo: {
            condoCode: {
              contains: keyword,
              mode: "insensitive"
            }
          }
        },

        {
          condo: {
            condoName: {
              contains: keyword,
              mode: "insensitive"
            }
          }
        },

        {
          occupiedBy: {
            fullName: {
              contains: keyword,
              mode: "insensitive"
            }
          }
        },

        {
          occupiedBy: {
            email: {
              contains: keyword,
              mode: "insensitive"
            }
          }
        },

        {
          occupiedBy: {
            phoneNumber: {
              contains: keyword,
              mode: "insensitive"
            }
          }
        }
      ];

      if (
        Number.isInteger(
          searchNumber
        )
      ) {
        where.OR.push({
          floorNo:
            searchNumber
        });
      }

      const normalized =
        keyword.toLowerCase();

      if (
        [
          "studio",
          "one_bedroom",
          "two_bedroom",
          "three_bedroom"
        ].includes(normalized)
      ) {
        where.OR.push({
          model: normalized
        });
      }

      if (
        [
          "free",
          "occupied",
          "reserved"
        ].includes(normalized)
      ) {
        where.OR.push({
          status: normalized
        });
      }
    }

    return prisma.room.findMany({
      where,
      select: adminRoomSelect,
      orderBy: [
        {
          blockId: "asc"
        },
        {
          floorNo: "asc"
        },
        {
          roomNo: "asc"
        }
      ]
    });
  };

// GET ADMIN ROOM BY ID
export const getRoomByIdService =
  async (
    condoId,
    roomId,
    requester
  ) => {
    checkCondoAccess(
      requester,
      condoId
    );

    const where = {
      id: String(roomId),
      deletedAt: null
    };

    if (condoId) {
      await validateCondo(condoId);

      where.condoId =
        String(condoId);
    } else if (
      requester.role ===
      "condo_admin"
    ) {
      where.condoId =
        String(requester.condoId);
    }

    const room =
      await prisma.room.findFirst({
        where,
        select: adminRoomSelect
      });

    if (!room) {
      throw new AppError(
        "Room not found",
        404
      );
    }

    return room;
  };

// UPDATE ROOM
export const updateRoomService =
  async (
    condoId,
    roomId,
    payload,
    requester
  ) => {
    checkCondoAccess(
      requester,
      condoId
    );

    const {
      error,
      value
    } = updateRoomSchema.validate(
      payload
    );

    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }

    const room =
      await prisma.room.findFirst({
        where: {
          id: String(roomId),
          condoId: String(condoId),
          deletedAt: null
        }
      });

    if (!room) {
      throw new AppError(
        "Room not found in this condominium",
        404
      );
    }

    const data = {};

    if (
      value.roomNo !== undefined
    ) {
      const existingRoom =
        await prisma.room.findFirst({
          where: {
            blockId: room.blockId,
            roomNo: value.roomNo,
            deletedAt: null,

            NOT: {
              id: room.id
            }
          }
        });

      if (existingRoom) {
        throw new AppError(
          "Room number already exists in this block",
          409
        );
      }

      data.roomNo =
        value.roomNo;
    }

    if (
      value.floorNo !== undefined
    ) {
      const block =
        await prisma.block.findFirst({
          where: {
            id: room.blockId,
            condoId:
              String(condoId),
            deletedAt: null
          },
          select: {
            noFloors: true
          }
        });

      if (
        !block ||
        value.floorNo >
          block.noFloors
      ) {
        throw new AppError(
          "Room floor cannot exceed block floors",
          400
        );
      }

      data.floorNo =
        value.floorNo;
    }

    if (
      value.price !== undefined
    ) {
      data.price =
        value.price;
    }

    if (
      value.model !== undefined
    ) {
      data.model =
        value.model;
    }

    return prisma.room.update({
      where: {
        id: room.id
      },
      data,
      select: adminRoomSelect
    });
  };

// UPDATE ROOM STATUS
export const updateRoomStatusService =
  async (
    condoId,
    roomId,
    payload,
    requester
  ) => {
    checkCondoAccess(
      requester,
      condoId
    );

    const {
      error,
      value
    } =
      updateRoomStatusSchema.validate(
        payload
      );

    if (error) {
      throw new AppError(
        error.details[0].message,
        400
      );
    }

    const room =
      await prisma.room.findFirst({
        where: {
          id: String(roomId),
          condoId: String(condoId),
          deletedAt: null
        }
      });

    if (!room) {
      throw new AppError(
        "Room not found in this condominium",
        404
      );
    }

    let occupiedById = null;

    if (
      value.status ===
      "occupied"
    ) {
      if (!value.occupiedById) {
        throw new AppError(
          "occupiedById is required when room is occupied",
          400
        );
      }

      const user =
        await prisma.user.findFirst({
          where: {
            id:
              value.occupiedById,

            condoId:
              String(condoId),

            deletedAt: null
          }
        });

      if (!user) {
        throw new AppError(
          "User does not belong to this condominium",
          400
        );
      }

      occupiedById =
        user.id;
    }

    if (
      value.status ===
      "reserved"
    ) {
      if (value.occupiedById) {
        const user =
          await prisma.user.findFirst({
            where: {
              id:
                value.occupiedById,

              condoId:
                String(condoId),

              deletedAt: null
            }
          });

        if (!user) {
          throw new AppError(
            "User does not belong to this condominium",
            400
          );
        }

        occupiedById =
          user.id;
      }
    }

    return prisma.room.update({
      where: {
        id: room.id
      },

      data: {
        status:
          value.status,

        occupiedById
      },

      select:
        adminRoomSelect
    });
  };

// GET AVAILABLE ROOMS
export const getAvailableRoomsService =
  async (
    condoId,
    requester,
    blockId
  ) => {
    if (requester) {
      return getAllRoomsService({
        condoId,
        requester,
        blockId,
        status: "free"
      });
    }

    return getPublicRoomsService({
      condoId,
      blockId,
      status: "free"
    });
  };

// GET OCCUPIED ROOMS
export const getOccupiedRoomsService =
  async (
    condoId,
    requester,
    blockId
  ) => {
    if (!requester) {
      return getPublicRoomsService({
        condoId,
        blockId,
        status: "occupied"
      });
    }

    return getAllRoomsService({
      condoId,
      requester,
      blockId,
      status: "occupied"
    });
  };

// GET RESERVED ROOMS
export const getReservedRoomsService =
  async (
    condoId,
    requester,
    blockId
  ) => {
    if (!requester) {
      return getPublicRoomsService({
        condoId,
        blockId,
        status: "reserved"
      });
    }

    return getAllRoomsService({
      condoId,
      requester,
      blockId,
      status: "reserved"
    });
  };

// DELETE ROOM
export const deleteRoomService =
  async (
    condoId,
    roomId,
    requester
  ) => {
    checkCondoAccess(
      requester,
      condoId
    );

    const where = {
      id: String(roomId),
      condoId: String(condoId),
      deletedAt: null
    };

    if (
      requester.role ===
      "condo_admin"
    ) {
      where.condoId =
        String(requester.condoId);
    }

    const room =
      await prisma.room.findFirst({
        where
      });

    if (!room) {
      throw new AppError(
        "Room not found in this condominium",
        404
      );
    }

    if (
      room.status ===
      "occupied"
    ) {
      throw new AppError(
        "Occupied room cannot be deleted",
        400
      );
    }

    await prisma.room.update({
      where: {
        id: room.id
      },

      data: {
        deletedAt:
          new Date()
      }
    });

    return {
      deleted: true,
      roomId: room.id
    };
  };