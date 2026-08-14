import {
  createIddirService,
  getIddirsService,
  getIddirByIdService,
  updateIddirService,
  deleteIddirService,
} from "../services/iddir.service.js";
export const createIddirController = async (req, res, next) => {

  try {

    const iddir = await createIddirService(
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

export const getIddirsController = async (req, res, next) => {

  try {

    const iddirs = await getIddirsService(
      req.user
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

export const getIddirByIdController = async (req, res, next) => {

  try {

    const iddir = await getIddirByIdService(
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

export const updateIddirController = async (req, res, next) => {

  try {

    const iddir = await updateIddirService(
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

export const deleteIddirController = async (req, res, next) => {

  try {

    const iddir = await deleteIddirService(
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