export class User {

  constructor({
    id,
    fullName,
    email,
    password,
    role,
    phoneNumber,
    createdAt,
    updatedAt
  }) {

    this.id = id;

    this.fullName = fullName;

    this.email = email;

    this.password = password;

    this.role = role;

    this.phoneNumber = phoneNumber;

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

      createdAt: this.createdAt,

      updatedAt: this.updatedAt,
    };
  }
}