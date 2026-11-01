export const USER_ROLES = Object.freeze([
  "Super Admin",
  "Admin",
  "Manager",
  "Employee",
  "Learner",
  "Instructor",
  "InstituteAdmin",
]);

export const ADMIN_ROLES = Object.freeze(["Super Admin", "Admin"]);

export const isAdminRole = (role) => ADMIN_ROLES.includes(role);
