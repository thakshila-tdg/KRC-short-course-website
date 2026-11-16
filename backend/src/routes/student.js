import { Router } from 'express'
import Enrollment from '../models/Enrollment.js'
import Material from '../models/Material.js'
import Payment from '../models/Payment.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { serializeMany } from '../lib/serialize.js'

const router = Router()

// Every route in this file needs a signed-in user
router.use(requireAuth)

// A material belongs to a course when its course name matches the enrollment's
// title, slug or code (exact match), or when the enrollment title contains it.
function materialsForEnrollments(enrollments, allMaterials) {
  const keys = enrollments
    .flatMap((e) => [e.title, e.course_slug, e.course_code])
    .filter(Boolean)
    .map((s) => s.toLowerCase())

  return allMaterials.filter((m) => {
    const name = (m.course_title || '').toLowerCase()
    if (!name) return false
    return keys.some((k) => k === name || k.includes(name))
  })
}

async function loadEnrollments(userId) {
  const rows = await Enrollment.find({ user_id: userId }).sort({ _id: -1 }).lean()
  return serializeMany(rows)
}

async function loadMaterialsFor(enrolled) {
  if (enrolled.length === 0) return []
  const all = await Material.find().sort({ _id: 1 }).lean()
  return serializeMany(materialsForEnrollments(enrolled, all))
}

// Short, stable display id built from the account id
function regIdFor(userId) {
  const n = parseInt(String(userId).slice(-6), 16) % 100000
  return `OUSL/2026/SC-${String(n).padStart(5, '0')}`
}

// 1. GET /api/student/dashboard - everything the student portal needs
router.get('/dashboard', asyncHandler(async (req, res) => {
  const u = req.user
  const enrolled = await loadEnrollments(u.id)
  const materials = await loadMaterialsFor(enrolled)
  const payments = serializeMany(await Payment.find({ user_id: u.id }).sort({ _id: -1 }).lean())

  res.json({
    success: true,
    profile: {
      id: u.id,
      name: u.full_name,
      email: u.email,
      phone: u.phone || 'Not provided',
      nic: u.nic || 'Not provided',
      regId: regIdFor(u.id),
      centre: 'Colombo Regional Centre (Nawala)',
      preferredLanguage: u.preferred_language || 'English',
      role: u.role
    },
    enrolled,
    materials,
    payments
  })
}))

// 2. GET /api/student/enrolled-courses
router.get('/enrolled-courses', asyncHandler(async (req, res) => {
  res.json({ success: true, courses: await loadEnrollments(req.user.id) })
}))

// 3. GET /api/student/payments
router.get('/payments', asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user_id: req.user.id }).sort({ _id: -1 }).lean()
  res.json({ success: true, payments: serializeMany(payments) })
}))

// 4. GET /api/student/materials
router.get('/materials', asyncHandler(async (req, res) => {
  const enrolled = await loadEnrollments(req.user.id)
  res.json({ success: true, materials: await loadMaterialsFor(enrolled) })
}))

export default router
