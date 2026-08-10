export const Roles = Object.freeze({
  RESIDENT: "resident",
  GUARD: "guard",
  CONDO_ADMIN: "condo_admin",
  SUPER_ADMIN: "super_admin",
});

export const rolePriority = Object.freeze({
  [Roles.RESIDENT]: 1,
  [Roles.GUARD]: 2,
  [Roles.CONDO_ADMIN]: 3,
  [Roles.SUPER_ADMIN]: 4
})