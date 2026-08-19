import {
  addEqubMemberService,
  getEqubMembersService,
  searchEqubMembersService,
  getEqubMemberByIdService,
  updateEqubMemberService,
  removeEqubMemberService,
} from "../services/equbMember.service.js";

// add equb member
export const addEqubMemberController = async (
  req,
  res,
  next
) => {
  try {
    const member = await addEqubMemberService(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "User added to Equb successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// get equb members
export const getEqubMembersController = async (
  req,
  res,
  next
) => {
  try {
    const members = await getEqubMembersService(
      {
        condoId: req.params.condoId || null,
        equbId: req.params.equbId || null,
        requester: req.user,
      }
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

// search equb members
export const searchEqubMembersController = async (
  req,
  res,
  next
) => {
  try {
    const result = await searchEqubMembersService({
      condoId: req.params.condoId || null,
      equbId: req.params.equbId || null,
      requester: req.user,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      count: result.members.length,
      pagination: result.pagination,
      data: result.members,
    });
  } catch (error) {
    next(error);
  }
};

// get equb member by id
export const getEqubMemberByIdController = async (
  req,
  res,
  next
) => {
  try {
    const member = await getEqubMemberByIdService(
      {
        memberId: req.params.id,
        condoId: req.params.condoId || null,
        equbId: req.params.equbId || null,
        requester: req.user,
      }
    );

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// update equb member
export const updateEqubMemberController = async (
  req,
  res,
  next
) => {
  try {
    const member = await updateEqubMemberService(
      req.params.id,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Equb member updated successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// remove equb member
export const removeEqubMemberController = async (
  req,
  res,
  next
) => {
  try {
    const member = await removeEqubMemberService(
      req.params.id,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "User removed from Equb successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};