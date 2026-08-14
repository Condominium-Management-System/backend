import AppError from "../errorhandler/AppError.js";
import { prisma } from "../config/prisma.config.js";

import {
  addIddirMemberValidation,
  updateIddirMemberValidation,
  iddirMemberIdValidation,
  iddirIdValidation,
} from "../inputValidation/iddirMemeber.validation.js"
export const addIddirMemberService = async (
  payload,
  requester
) => {

  const {
    error,
    value,
  } = addIddirMemberValidation.validate(payload);

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  /*
   * Authorization
   */

  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to add users to Iddir",
      403
    );
  }


  /*
   * Find Iddir
   */

  const iddir = await prisma.iddir.findFirst({
    where: {
      id: value.iddirId,
      deletedAt: null,
    },
  });

  if (!iddir) {
    throw new AppError(
      "Iddir not found",
      404
    );
  }


  /*
   * Condo admin can only manage
   * his own condominium
   */

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== iddir.condoId
  ) {
    throw new AppError(
      "You can only manage members of your own condominium",
      403
    );
  }


  /*
   * Iddir must be active
   */

  if (iddir.status !== "active") {
    throw new AppError(
      "Cannot add a member to an inactive Iddir",
      400
    );
  }


  /*
   * Find user
   */

  const user = await prisma.user.findFirst({
    where: {
      id: value.userId,
      deletedAt: null,
    },
  });

  if (!user) {
    throw new AppError(
      "User not found",
      404
    );
  }


  /*
   * User must belong to same condo
   */

  if (user.condoId !== iddir.condoId) {
    throw new AppError(
      "User does not belong to this condominium",
      400
    );
  }


  /*
   * Don't allow super admin,
   * guard or condo admin as Iddir member
   * if your business rule is resident-only.
   */

  if (user.role !== "resident") {
    throw new AppError(
      "Only residents can become Iddir members",
      400
    );
  }


  /*
   * Check existing membership
   */

  const existingMember =
    await prisma.iddirMember.findUnique({
      where: {
        iddirId_userId: {
          iddirId: value.iddirId,
          userId: value.userId,
        },
      },
    });


  /*
   * If membership already exists
   */

  if (existingMember) {

    if (
      existingMember.status === "active"
    ) {
      throw new AppError(
        "User is already an active member of this Iddir",
        409
      );
    }


    /*
     * Reactivate inactive/suspended member
     */

    const member = await prisma.$transaction(
      async (tx) => {

        const updatedMember =
          await tx.iddirMember.update({

            where: {
              id: existingMember.id,
            },

            data: {
              status: "active",
              joinedAt: new Date(),
              leftAt: null,
            },

            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                  role: true,
                  condoId: true,
                  block: true,
                  roomNo: true,
                  isInIddir: true,
                },
              },

              iddir: {
                select: {
                  id: true,
                  name: true,
                  condoId: true,
                  contributionAmount: true,
                },
              },
            },
          });


        await tx.user.update({
          where: {
            id: value.userId,
          },

          data: {
            isInIddir: true,
          },
        });


        /*
         * Only increment if the old
         * membership wasn't active
         */

        await tx.iddir.update({
          where: {
            id: value.iddirId,
          },

          data: {
            noMembers: {
              increment: 1,
            },
          },
        });


        return updatedMember;
      }
    );


    return member;
  }


  /*
   * Check if user is already active
   * in another Iddir.
   */

  const activeMembership =
    await prisma.iddirMember.findFirst({
      where: {
        userId: value.userId,
        status: "active",
        iddirId: {
          not: value.iddirId,
        },
      },
    });


  if (activeMembership) {
    throw new AppError(
      "User is already an active member of another Iddir",
      409
    );
  }


  /*
   * Create membership
   */

  const member = await prisma.$transaction(
    async (tx) => {

      const newMember =
        await tx.iddirMember.create({

          data: {
            iddirId: value.iddirId,
            userId: value.userId,
            status: "active",
          },

          include: {

            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phoneNumber: true,
                role: true,
                condoId: true,
                block: true,
                roomNo: true,
                isInIddir: true,
              },
            },

            iddir: {
              select: {
                id: true,
                name: true,
                condoId: true,
                contributionAmount: true,
              },
            },
          },
        });


      /*
       * Update User
       */

      await tx.user.update({
        where: {
          id: value.userId,
        },

        data: {
          isInIddir: true,
        },
      });


      /*
       * Update Iddir member count
       */

      await tx.iddir.update({
        where: {
          id: value.iddirId,
        },

        data: {
          noMembers: {
            increment: 1,
          },
        },
      });


      return newMember;
    }
  );


  return member;
};

export const getIddirMembersService = async (
  iddirId,
  requester
) => {

  /*
   * Validate ID
   */

  const {
    error,
    value,
  } = iddirIdValidation.validate({
    iddirId,
  });

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  /*
   * Authorization
   */

  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to view Iddir members",
      403
    );
  }


  /*
   * Find Iddir
   */

  const iddir = await prisma.iddir.findFirst({
    where: {
      id: value.iddirId,
      deletedAt: null,
    },
  });

  if (!iddir) {
    throw new AppError(
      "Iddir not found",
      404
    );
  }


  /*
   * Condo access
   */

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== iddir.condoId
  ) {
    throw new AppError(
      "You can only view members from your own condominium",
      403
    );
  }


  /*
   * Get members
   */

  const members =
    await prisma.iddirMember.findMany({

      where: {
        iddirId: value.iddirId,
      },

      include: {

        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            condoId: true,
            condoCode: true,
            block: true,
            roomNo: true,
            profilePhoto: true,
            isInIddir: true,
          },
        },

        iddir: {
          select: {
            id: true,
            name: true,
            status: true,
            contributionAmount: true,
            startedDate: true,
            noMembers: true,
          },
        },
      },

      orderBy: {
        joinedAt: "desc",
      },
    });


  return members;
};

export const getIddirMemberByIdService = async (
  memberId,
  requester
) => {

  const {
    error,
    value,
  } = iddirMemberIdValidation.validate({
    id: memberId,
  });

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  const member =
    await prisma.iddirMember.findUnique({

      where: {
        id: value.id,
      },

      include: {

        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            condoId: true,
            condoCode: true,
            block: true,
            roomNo: true,
            profilePhoto: true,
            isInIddir: true,
          },
        },

        iddir: {
          select: {
            id: true,
            name: true,
            condoId: true,
            status: true,
            contributionAmount: true,
            startedDate: true,
            noMembers: true,
          },
        },
      },
    });


  if (!member) {
    throw new AppError(
      "Iddir member not found",
      404
    );
  }


  /*
   * Condo admin access
   */

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== member.iddir.condoId
  ) {
    throw new AppError(
      "You are not authorized to view this member",
      403
    );
  }


  return member;
};

export const updateIddirMemberService = async (
  memberId,
  payload,
  requester
) => {

  /*
   * Validate body
   */

  const {
    error,
    value,
  } = updateIddirMemberValidation.validate(
    payload
  );

  if (error) {
    throw new AppError(
      error.details[0].message,
      400
    );
  }


  /*
   * Authorization
   */

  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to update Iddir members",
      403
    );
  }


  /*
   * Find member
   */

  const member =
    await prisma.iddirMember.findUnique({

      where: {
        id: memberId,
      },

      include: {
        iddir: true,
        user: true,
      },
    });


  if (!member) {
    throw new AppError(
      "Iddir member not found",
      404
    );
  }


  /*
   * Condo admin access
   */

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== member.iddir.condoId
  ) {
    throw new AppError(
      "You can only update members from your own condominium",
      403
    );
  }


  /*
   * Nothing to do
   */

  if (member.status === value.status) {
    return member;
  }


  /*
   * Active → inactive/suspended
   */

  if (
    member.status === "active" &&
    (
      value.status === "inactive" ||
      value.status === "suspended"
    )
  ) {

    const updatedMember =
      await prisma.$transaction(
        async (tx) => {

          const updated =
            await tx.iddirMember.update({

              where: {
                id: memberId,
              },

              data: {
                status: value.status,
                leftAt: new Date(),
              },

              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    condoId: true,
                    block: true,
                    roomNo: true,
                    isInIddir: true,
                  },
                },

                iddir: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                    noMembers: true,
                  },
                },
              },
            });


          /*
           * Check whether user has another
           * active Iddir membership.
           */

          const anotherActive =
            await tx.iddirMember.findFirst({

              where: {
                userId: member.userId,

                status: "active",

                id: {
                  not: memberId,
                },
              },
            });


          await tx.user.update({

            where: {
              id: member.userId,
            },

            data: {
              isInIddir: Boolean(anotherActive),
            },
          });


          /*
           * Decrease member count
           */

          await tx.iddir.update({

            where: {
              id: member.iddirId,
            },

            data: {
              noMembers: {
                decrement: 1,
              },
            },
          });


          return updated;
        }
      );


    return updatedMember;
  }


  /*
   * Inactive/suspended → active
   */

  if (
    (
      member.status === "inactive" ||
      member.status === "suspended"
    ) &&
    value.status === "active"
  ) {

    /*
     * Check another active Iddir
     */

    const anotherActive =
      await prisma.iddirMember.findFirst({

        where: {
          userId: member.userId,

          status: "active",

          id: {
            not: memberId,
          },
        },
      });


    if (anotherActive) {
      throw new AppError(
        "User is already an active member of another Iddir",
        409
      );
    }


    const updatedMember =
      await prisma.$transaction(
        async (tx) => {

          const updated =
            await tx.iddirMember.update({

              where: {
                id: memberId,
              },

              data: {
                status: "active",
                leftAt: null,
              },

              include: {

                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    role: true,
                    condoId: true,
                    block: true,
                    roomNo: true,
                    isInIddir: true,
                  },
                },

                iddir: {
                  select: {
                    id: true,
                    name: true,
                    status: true,
                    noMembers: true,
                  },
                },
              },
            });


          await tx.user.update({

            where: {
              id: member.userId,
            },

            data: {
              isInIddir: true,
            },
          });


          await tx.iddir.update({

            where: {
              id: member.iddirId,
            },

            data: {
              noMembers: {
                increment: 1,
              },
            },
          });


          return updated;
        }
      );


    return updatedMember;
  }


  throw new AppError(
    "Invalid member status transition",
    400
  );
};

export const removeIddirMemberService = async (
  memberId,
  requester
) => {

  /*
   * Authorization
   */

  if (
    requester.role !== "super_admin" &&
    requester.role !== "condo_admin"
  ) {
    throw new AppError(
      "You are not authorized to remove Iddir members",
      403
    );
  }


  /*
   * Find member
   */

  const member =
    await prisma.iddirMember.findUnique({

      where: {
        id: memberId,
      },

      include: {
        iddir: true,
        user: true,
      },
    });


  if (!member) {
    throw new AppError(
      "Iddir member not found",
      404
    );
  }


  /*
   * Condo admin access
   */

  if (
    requester.role === "condo_admin" &&
    requester.condoId !== member.iddir.condoId
  ) {
    throw new AppError(
      "You can only remove members from your own condominium",
      403
    );
  }


  /*
   * Already inactive
   */

  if (member.status !== "active") {
    throw new AppError(
      "This user is not an active member of the Iddir",
      400
    );
  }


  /*
   * Don't allow removal if member
   * has unpaid/financial obligations.
   *
   * For now we don't automatically block it.
   * You can add that business rule later.
   */

  const result =
    await prisma.$transaction(
      async (tx) => {

        /*
         * Mark member inactive
         */

        const updatedMember =
          await tx.iddirMember.update({

            where: {
              id: memberId,
            },

            data: {
              status: "inactive",
              leftAt: new Date(),
            },

            include: {

              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phoneNumber: true,
                },
              },

              iddir: {
                select: {
                  id: true,
                  name: true,
                  noMembers: true,
                },
              },
            },
          });


        /*
         * Check if user belongs to another
         * active Iddir.
         */

        const anotherActive =
          await tx.iddirMember.findFirst({

            where: {
              userId: member.userId,

              status: "active",

              id: {
                not: memberId,
              },
            },
          });


        /*
         * Update user's global flag
         */

        await tx.user.update({

          where: {
            id: member.userId,
          },

          data: {
            isInIddir: Boolean(anotherActive),
          },
        });


        /*
         * Decrease Iddir member count
         */

        await tx.iddir.update({

          where: {
            id: member.iddirId,
          },

          data: {
            noMembers: {
              decrement: 1,
            },
          },
        });


        return updatedMember;
      }
    );


  return result;
};