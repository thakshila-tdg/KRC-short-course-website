/**
 * Staff management (admins and instructors).
 * Mounted at /api/admin/staff, after the staff check in admin.js.
 *
 * Who can do what is decided by permissions.js:
 *   - superadmin: create / update / delete / reset admins and instructors, change roles
 *   - admin:      create / update / delete / reset instructors only
 *   - instructor: nothing here
 * Super admin accounts are never changed through these routes.
 */
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Course from '../models/Course.js'
import { requirePermission } from '../middleware/auth.js'
import { hasPermission, STAFF_ROLES } from '../config/permissions.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { serialize } from '../lib/serialize.js'
import { str } from '../lib/text.js'
import { generateTempPassword } from '../lib/password.js'
import { profileFields, PROFILE_SELECT } from '../lib/profile.js'

const router = Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MANAGEABLE_ROLES = ['instructor', 'admin']
const isId = (value) => mongoose.isObjectIdOrHexString(value)

// e.g. can(actor, 'create', 'admin') checks the permission "staff:create_admin"
const can = (actor, action, targetRole) => hasPermission(actor.role, `staff:${action}_${targetRole}`)

const deny = (res, message) => res.status(403).json({ success: false, message })
const notFound = (res) => res.status(404).json({ success: false, message: 'Staff member not found.' })

// Staff rows with the courses each instructor is assigned to
async function staffViews(users) {
  const courses = await Course.find().select('slug title instructors').lean()
  return users.map((u) => ({
    ...serialize(u),
    courses:
      u.role === 'instructor'
        ? courses
            .filter((c) => (c.instructors || []).some((i) => String(i) === String(u._id)))
            .map((c) => ({ slug: c.slug, title: c.title }))
        : []
  }))
}

// Replaces the list of courses an instructor teaches
async function setInstructorCourses(instructorId, slugs) {
  await Course.updateMany({ instructors: instructorId }, { $pull: { instructors: instructorId } })
  const clean = (Array.isArray(slugs) ? slugs : []).map((s) => String(s).trim()).filter(Boolean)
  if (clean.length) {
    await Course.updateMany({ slug: { $in: clean } }, { $addToSet: { instructors: instructorId } })
  }
}

// Loads a staff member and applies the rules every change shares.
// Returns the target, or null after sending the error response.
async function loadManageableTarget(req, res, action) {
  if (!isId(req.params.id)) {
    notFound(res)
    return null
  }
  const target = await User.findById(req.params.id)
  if (!target || !STAFF_ROLES.includes(target.role)) {
    notFound(res)
    return null
  }
  if (target.role === 'superadmin') {
    deny(res, 'Super admin accounts cannot be changed here.')
    return null
  }
  if (String(target._id) === req.user.id) {
    deny(res, action === 'update' ? 'Use My Profile to edit your own account.' : 'You cannot do this to your own account.')
    return null
  }
  if (!can(req.user, action, target.role)) {
    deny(res, `You do not have permission to ${action} ${target.role} accounts.`)
    return null
  }
  return target
}

// 1. GET /api/admin/staff?role=instructor
router.get('/', requirePermission('staff:view'), asyncHandler(async (req, res) => {
  const role = str(req.query.role)
  const roles = role && STAFF_ROLES.includes(role) ? [role] : STAFF_ROLES
  const users = await User.find({ role: { $in: roles } }).select(PROFILE_SELECT).sort({ _id: 1 }).lean()
  res.json({ success: true, total: users.length, staff: await staffViews(users) })
}))

// 2. POST /api/admin/staff - create an admin or instructor with a temporary password
router.post('/', asyncHandler(async (req, res) => {
  const b = req.body || {}
  const role = str(b.role) || 'instructor'

  if (role === 'superadmin') {
    return deny(res, 'Super admin accounts can only be created by the seed script.')
  }
  if (!MANAGEABLE_ROLES.includes(role)) {
    return res.status(400).json({ success: false, message: 'role must be "instructor" or "admin".' })
  }
  if (!can(req.user, 'create', role)) {
    return deny(res, `You do not have permission to create ${role} accounts.`)
  }

  const fullName = str(b.fullName)
  const email = str(b.email).toLowerCase()
  if (!fullName || !email) {
    return res.status(400).json({ success: false, message: 'Full name and email are required.' })
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
  }
  if (await User.exists({ email })) {
    return res.status(409).json({ success: false, message: 'An account with this email address already exists.' })
  }

  const temporaryPassword = generateTempPassword()
  let user
  try {
    user = await User.create({
      ...profileFields(b),
      full_name: fullName,
      email,
      role,
      password_hash: await bcrypt.hash(temporaryPassword, 12),
      must_change_password: true,
      created_by: req.user.id
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' })
    }
    throw err
  }

  if (role === 'instructor' && Array.isArray(b.courseSlugs) && hasPermission(req.user.role, 'course:assign_instructors')) {
    await setInstructorCourses(user._id, b.courseSlugs)
  }

  const saved = await User.findById(user._id).select(PROFILE_SELECT).lean()
  const [staff] = await staffViews([saved])

  res.status(201).json({
    success: true,
    message: `${role === 'admin' ? 'Admin' : 'Instructor'} account created. Share the temporary password with them now; it is shown only once.`,
    staff,
    temporaryPassword
  })
}))

// 3. PUT /api/admin/staff/:id - edit profile, courses and (super admin only) role
router.put('/:id', asyncHandler(async (req, res) => {
  const target = await loadManageableTarget(req, res, 'update')
  if (!target) return

  const b = req.body || {}
  const update = profileFields(b)

  if (b.role !== undefined && b.role !== target.role) {
    if (!hasPermission(req.user.role, 'staff:change_role')) {
      return deny(res, 'Only a super admin can change roles.')
    }
    if (!MANAGEABLE_ROLES.includes(b.role)) {
      return res.status(400).json({ success: false, message: 'role must be "instructor" or "admin".' })
    }
    update.role = b.role
  }

  Object.assign(target, update)
  await target.save()

  // Only instructors are assigned to courses
  if (target.role !== 'instructor') {
    await setInstructorCourses(target._id, [])
  } else if (Array.isArray(b.courseSlugs)) {
    if (!hasPermission(req.user.role, 'course:assign_instructors')) {
      return deny(res, 'You do not have permission to assign courses.')
    }
    await setInstructorCourses(target._id, b.courseSlugs)
  }

  const saved = await User.findById(target._id).select(PROFILE_SELECT).lean()
  const [staff] = await staffViews([saved])
  res.json({ success: true, message: 'Staff member updated.', staff })
}))

// 4. POST /api/admin/staff/:id/reset-password - new temporary password, shown once
router.post('/:id/reset-password', asyncHandler(async (req, res) => {
  const target = await loadManageableTarget(req, res, 'reset')
  if (!target) return

  const temporaryPassword = generateTempPassword()
  target.password_hash = await bcrypt.hash(temporaryPassword, 12)
  target.must_change_password = true
  target.failed_login_attempts = 0
  target.lockout_until = null
  target.reset_token_hash = null
  target.reset_token_expiry = null
  await target.save()

  res.json({
    success: true,
    message: 'Password reset. Share the temporary password now; it is shown only once.',
    temporaryPassword
  })
}))

// 5. DELETE /api/admin/staff/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const target = await loadManageableTarget(req, res, 'delete')
  if (!target) return

  await setInstructorCourses(target._id, [])
  await User.deleteOne({ _id: target._id })
  res.json({ success: true, message: 'Staff member removed.' })
}))

export default router
