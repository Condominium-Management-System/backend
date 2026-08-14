import {
  createEqubService,
  getAllEqubsService,
  getEqubByIdService,
  updateEqubService,
  deleteEqubService,
  addEqubMemberService,
  removeEqubMemberService,
  updateEqubMemberService,
  getEqubMembersService,
  selectEqubWinnerService,
} from "../services/equb.service.js";


// CREATE

export const createEqubController = async (
  req,
  res,
  next
) => {

  try {

    const equb =
      await createEqubService(
        req.user,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Equb created successfully",
      data: equb,
    });

  } catch (error) {
    next(error);
  }
};


// GET ALL

export const getAllEqubsController = async (
  req,
  res,
  next
) => {

  try {

    const equbs =
      await getAllEqubsService(
        req.user
      );

    res.status(200).json({
      success: true,
      data: equbs,
    });

  } catch (error) {
    next(error);
  }
};


// GET ONE

export const getEqubByIdController = async (
  req,
  res,
  next
) => {

  try {

    const equb =
      await getEqubByIdService(
        req.user,
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: equb,
    });

  } catch (error) {
    next(error);
  }
};


// UPDATE

export const updateEqubController = async (
  req,
  res,
  next
) => {

  try {

    const equb =
      await updateEqubService(
        req.user,
        req.params.id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Equb updated successfully",
      data: equb,
    });

  } catch (error) {
    next(error);
  }
};


// DELETE

export const deleteEqubController = async (
  req,
  res,
  next
) => {

  try {

    await deleteEqubService(
      req.user,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Equb deleted successfully",
    });

  } catch (error) {
    next(error);
  }
};


// ADD MEMBER

export const addEqubMemberController = async (
  req,
  res,
  next
) => {

  try {

    const member =
      await addEqubMemberService(
        req.user,
        req.params.id,
        req.body
      );

    res.status(201).json({
      success: true,
      message: "User added to Equb successfully",
      data: member,
    });

  } catch (error) {
    next(error);
  }
};


// REMOVE MEMBER

export const removeEqubMemberController = async (
  req,
  res,
  next
) => {

  try {

    await removeEqubMemberService(
      req.user,
      req.params.id,
      req.params.userId
    );

    res.status(200).json({
      success: true,
      message: "User removed from Equb successfully",
    });

  } catch (error) {
    next(error);
  }
};


// UPDATE MEMBER

export const updateEqubMemberController = async (
  req,
  res,
  next
) => {

  try {

    const member =
      await updateEqubMemberService(
        req.user,
        req.params.id,
        req.params.userId,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Equb member updated successfully",
      data: member,
    });

  } catch (error) {
    next(error);
  }
};


// GET MEMBERS

export const getEqubMembersController = async (
  req,
  res,
  next
) => {

  try {

    const members =
      await getEqubMembersService(
        req.user,
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: members,
    });

  } catch (error) {
    next(error);
  }
};


// SELECT WINNER

export const selectEqubWinnerController = async (
  req,
  res,
  next
) => {

  try {

    const winner =
      await selectEqubWinnerService(
        req.user,
        req.params.id
      );

    res.status(200).json({
      success: true,
      message: "Equb winner selected successfully",
      data: winner,
    });

  } catch (error) {
    next(error);
  }
};