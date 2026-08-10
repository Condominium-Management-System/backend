import bcrypt from "bcryptjs"

export const hashPassword = (password) => bcrypt.hash(password, 12)

export const comparePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword)
}