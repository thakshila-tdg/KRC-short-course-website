/**
 * Public staff directory (no login needed).
 * Lists instructors whose profile is marked public. Emails and phone numbers are never included.
 * Mounted at /api/staff
 */
import { Router } from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Course from '../models/Course.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()

const PUBLIC_FIELDS = 'full_name title department qualifications bio photo_url'

async function withCourses(users) {
  const courses = await Course.find().select('slug title instructors').lean()
  return users.map((u) => ({
    id: String(u._id),
    full_name: u.full_name,
    title: u.title || '',
    department: u.department || '',
    qualifications: u.qualifications || '',
    bio: u.bio || '',
    photo_url: u.photo_url || '',
    courses: courses
      .filter((c) => (c.instructors || []).some((i) => String(i) === String(u._id)))
      .map((c) => ({ slug: c.slug, title: c.title }))
  }))
}

// GET /api/staff
router.get('/', asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'instructor', public_profile: true }).select(PUBLIC_FIELDS).sort({ full_name: 1 }).lean()
  res.json({ success: true, staff: await withCourses(users) })
}))

// GET /api/staff/:id
router.get('/:id', asyncHandler(async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Staff member not found.' })
  }
  const user = await User.findOne({ _id: req.params.id, role: 'instructor', public_profile: true }).select(PUBLIC_FIELDS).lean()
  if (!user) {
    return res.status(404).json({ success: false, message: 'Staff member not found.' })
  }
  const [staff] = await withCourses([user])
  res.json({ success: true, staff })
}))

export default router
