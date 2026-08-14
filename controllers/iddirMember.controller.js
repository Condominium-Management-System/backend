
import {
  addIddirMemberService,
  getIddirMembersService,
  getIddirMemberByIdService,
  updateIddirMemberService,
  removeIddirMemberService,
} from "../services/iddirMember.service.js";
export const addIddirMemberController = async (
  req,
  res,
  next
) => {

  try {

    const member =
      await addIddirMemberService(
        req.body,
        req.user
      );


    return res.status(201).json({

      success: true,

      message:
        "User added to Iddir successfully",

      data: member,
    });

  } catch (error) {

    next(error);

  }
};
export const getIddirMembersController = async (
  req,
  res,
  next
) => {

  try {

    const members =
      await getIddirMembersService(
        req.params.iddirId,
        req.user
      );


    return res.status(200).json({

      success: true,

      count: members.length,

      data: members,
    });

  } catch (error) {

    next(error);

  }
};


export const getIddirMemberByIdController = async (
  req,
  res,
  next
) => {

  try {

    const member =
      await getIddirMemberByIdService(
        req.params.id,
        req.user
      );


    return res.status(200).json({

      success: true,

      data: member,
    });

  } catch (error) {

    next(error);

  }
};


export const updateIddirMemberController = async (
  req,
  res,
  next
) => {

  try {

    const member =
      await updateIddirMemberService(

        req.params.id,

        req.body,

        req.user
      );


    return res.status(200).json({

      success: true,

      message:
        "Iddir member updated successfully",

      data: member,
    });

  } catch (error) {

    next(error);

  }
};


export const removeIddirMemberController = async (
  req,
  res,
  next
) => {

  try {

    const member =
      await removeIddirMemberService(
        req.params.id,
        req.user
      );


    return res.status(200).json({

      success: true,

      message:
        "User removed from Iddir successfully",

      data: member,
    });

  } catch (error) {

    next(error);

  }
};