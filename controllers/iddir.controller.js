import {
  createIddirService,
  getPublicIddirsService,
  getPublicIddirByIdService,
  getIddirsService,
  getIddirByIdService,
  searchIddirsService,
  updateIddirService,
  deleteIddirService,
} from "../services/iddir.service.js";

// Create Iddir
export const createIddirController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await createIddirService(
        req.params.condoId,
        req.body,
        req.user
      );

    res.status(201).json({
      success: true,
      message: "Iddir created successfully",
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};

// Get public Iddirs
export const getPublicIddirsController = async (
  req,
  res,
  next
) => {
  try {
    const iddirs =
      await getPublicIddirsService(
        req.query
      );

    res.status(200).json({
      success: true,
      count: iddirs.length,
      data: iddirs,
    });
  } catch (error) {
    next(error);
  }
};

// Get public Iddir by id
export const getPublicIddirByIdController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const iddir =
        await getPublicIddirByIdService(
          req.params.id
        );

      res.status(200).json({
        success: true,
        data: iddir,
      });
    } catch (error) {
      next(error);
    }
  };

// Get admin Iddirs
export const getIddirsController = async (
  req,
  res,
  next
) => {
  try {
    const iddirs =
      await getIddirsService({
        condoId:
          req.params.condoId || null,
        requester: req.user,
        query: req.query,
      });

    res.status(200).json({
      success: true,
      count: iddirs.length,
      data: iddirs,
    });
  } catch (error) {
    next(error);
  }
};

// Search admin Iddirs
export const searchIddirsController = async (
  req,
  res,
  next
) => {
  try {
    const iddirs =
      await searchIddirsService({
        condoId:
          req.params.condoId || null,
        requester: req.user,
        search:
          req.query.search,
        status:
          req.query.status,
      });

    res.status(200).json({
      success: true,
      count: iddirs.length,
      data: iddirs,
    });
  } catch (error) {
    next(error);
  }
};

// Get admin Iddir by id
export const getIddirByIdController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await getIddirByIdService(
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};

// Update Iddir
export const updateIddirController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await updateIddirService(
        req.params.condoId,
        req.params.id,
        req.body,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Iddir updated successfully",
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Iddir
export const deleteIddirController = async (
  req,
  res,
  next
) => {
  try {
    const iddir =
      await deleteIddirService(
        req.params.condoId,
        req.params.id,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Iddir deleted successfully",
      data: iddir,
    });
  } catch (error) {
    next(error);
  }
};