import {
  addIddirMemberService,
  getIddirMembersService,
  searchIddirMembersService,
  getIddirMemberByIdService,
  updateIddirMemberService,
  removeIddirMemberService,
} from "../services/iddirMember.service.js";

// Add Iddir member
export const addIddirMemberController = async (
  req,
  res,
  next
) => {
  try {
    const member = await addIddirMemberService(
      req.body,
      req.user
    );

    return res.status(201).json({
      success: true,
      message: "User added to Iddir successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Get Iddir members
export const getIddirMembersController = async (
  req,
  res,
  next
) => {
  try {
    const members = await getIddirMembersService({
      condoId: req.params.condoId || null,
      iddirId: req.params.iddirId || null,
      requester: req.user,
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// Search Iddir members
export const searchIddirMembersController = async (
  req,
  res,
  next
) => {
  try {
    const members = await searchIddirMembersService({
      condoId: req.params.condoId || null,
      iddirId: req.query.iddirId || null,
      search: req.query.search,
      status: req.query.status,
      requester: req.user,
    });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

// Get Iddir member by ID
export const getIddirMemberByIdController = async (
  req,
  res,
  next
) => {
  try {
    const member = await getIddirMemberByIdService(
      req.params.id,
      req.params.condoId || null,
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

// Update Iddir member
export const updateIddirMemberController = async (
  req,
  res,
  next
) => {
  try {
    const member = await updateIddirMemberService(
      req.params.id,
      req.params.condoId || null,
      req.body,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "Iddir member updated successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};

// Remove Iddir member
export const removeIddirMemberController = async (
  req,
  res,
  next
) => {
  try {
    const member = await removeIddirMemberService(
      req.params.id,
      req.params.condoId || null,
      req.user
    );

    return res.status(200).json({
      success: true,
      message: "User removed from Iddir successfully",
      data: member,
    });
  } catch (error) {
    next(error);
  }
};