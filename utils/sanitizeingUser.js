export const toPublicUser = (user) => ({
  id: user.id,

  fullName: user.fullName,

  email: user.email,

  role: user.role,

  phoneNumber: user.phoneNumber,

  fan: user.fan,

  condoId: user.condoId,

  condoCode: user.condoCode,

  block: user.block,

  roomNo: user.roomNo,

  isVerified: user.isVerified,

  profilePhoto: user.profilePhoto,

  frontId: user.frontId,

  backId: user.backId,

  isInIddir: user.isInIddir,

  isInEqub: user.isInEqub,

  isGetEqub: user.isGetEqub,

  registerDate: user.registerDate,

  dueDate: user.dueDate,

  createdAt: user.createdAt,

  updatedAt: user.updatedAt,
});