// Single source of truth for "who can do what".
// Roles: student, instructor, admin, superadmin.
// The backend checks these on every protected route; the frontend only uses
// the list (returned by /api/auth/me) to decide which menu items to show.

export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin'
}

export const STAFF_ROLES = ['instructor', 'admin', 'superadmin']

const INSTRUCTOR_PERMISSIONS = [
  'dashboard:view',
  'course:view',
  'course:edit_content', // overview, objectives, curriculum, eligibility, description, duration, intake, images
  'student:view',
  'material:manage',
  'announcement:manage',
  'grade:manage',
  'profile:self'
  // Instructors only see and change the courses assigned to them (enforced in lib/scope.js)
]

const ADMIN_PERMISSIONS = [
  ...INSTRUCTOR_PERMISSIONS,
  'course:create',
  'course:delete',
  'course:edit_details', // title, category, faculty, fee, mode ...
  'course:assign_instructors',
  'inquiry:view',
  'staff:view',
  'staff:create_instructor',
  'staff:update_instructor',
  'staff:delete_instructor',
  'staff:reset_instructor'
]

const SUPERADMIN_PERMISSIONS = [
  ...ADMIN_PERMISSIONS,
  'staff:create_admin',
  'staff:update_admin',
  'staff:delete_admin',
  'staff:reset_admin',
  'staff:change_role'
]

const BY_ROLE = {
  student: [],
  instructor: INSTRUCTOR_PERMISSIONS,
  admin: ADMIN_PERMISSIONS,
  superadmin: SUPERADMIN_PERMISSIONS
}

export const permissionsFor = (role) => [...(BY_ROLE[role] || [])]
export const hasPermission = (role, permission) => (BY_ROLE[role] || []).includes(permission)
export const isStaffRole = (role) => STAFF_ROLES.includes(role)
