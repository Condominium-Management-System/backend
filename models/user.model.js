export class User {
  constructor({
    id,
    fullName,
    email,
    password,
    role,
    phoneNumber,
    fan,
    condoId,
    condoCode,
    block,
    roomNo,
    isVerified,
    profilePhoto,
    frontId,
    backId,
    isInIddir,
    isInEqub,
    isGetEqub,
    registerDate,
    dueDate,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.fullName = fullName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.phoneNumber = phoneNumber;
    this.fan = fan;
    this.condoId = condoId;
    this.condoCode = condoCode;
    this.block = block;
    this.roomNo = roomNo;
    this.isVerified = isVerified;
    this.profilePhoto = profilePhoto;
    this.frontId = frontId;
    this.backId = backId;
    this.isInIddir = isInIddir;
    this.isInEqub = isInEqub;
    this.isGetEqub = isGetEqub;
    this.registerDate = registerDate;
    this.dueDate = dueDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toPublicJSON() {
    return {
      id: this.id,
      fullName: this.fullName,
      email: this.email,
      role: this.role,
      phoneNumber: this.phoneNumber,
      fan: this.fan,
      condoId: this.condoId,
      condoCode: this.condoCode,
      block: this.block,
      roomNo: this.roomNo,
      isVerified: this.isVerified,
      profilePhoto: this.profilePhoto,
      frontId: this.frontId,
      backId: this.backId,
      isInIddir: this.isInIddir,
      isInEqub: this.isInEqub,
      isGetEqub: this.isGetEqub,
      registerDate: this.registerDate,
      dueDate: this.dueDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}