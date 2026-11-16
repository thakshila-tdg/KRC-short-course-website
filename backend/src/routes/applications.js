import { Router } from 'express'
import Application from '../models/Application.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import Payment from '../models/Payment.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { serialize } from '../lib/serialize.js'
import { str, randomDigits } from '../lib/text.js'

const router = Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_MODULES = ['Orientation & Induction', 'Module 1: Foundations', 'Module 2: Practical Lab', 'Final Assessment']

async function createWithUniqueRef(data) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await Application.create({ ...data, app_ref: `OUSL-APP-2026-${randomDigits()}` })
    } catch (err) {
      const duplicateRef = err.code === 11000 && err.keyPattern && err.keyPattern.app_ref
      if (!duplicateRef) throw err
    }
  }
  throw new Error('Could not generate a unique application reference. Please try again.')
}

async function createPayment(data, preferredRef) {
  let ref = preferredRef
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await Payment.create({ ...data, ref })
    } catch (err) {
      const duplicateRef = err.code === 11000 && err.keyPattern && err.keyPattern.ref
      if (!duplicateRef) throw err
      ref = `BOC-NWL-${randomDigits(1000000, 10000000)}`
    }
  }
  throw new Error('Could not record the payment reference. Please try again.')
}

// 1. POST /api/applications - submit a new course application (guests allowed)
router.post('/', asyncHandler(async (req, res) => {
  const b = req.body || {}
  const courseSlug = str(b.courseSlug)
  const fullName = str(b.fullName)
  const nic = str(b.nic)
  const email = str(b.email)
  const phone = str(b.phone)
  const centre = str(b.centre)

  if (!courseSlug || !fullName || !nic || !email || !phone || !centre) {
    return res.status(400).json({ success: false, message: 'Required application fields are missing.' })
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
  }

  const course = await Course.findOne({ slug: courseSlug }).lean()
  const courseTitle = str(b.courseTitle) || (course && course.title) || 'Short Course'
  const amount = str(b.amount) || (course && course.fee) || 'Rs. 20,000'
  const paymentMethod = str(b.paymentMethod) || 'boc_voucher'
  const userId = req.user ? req.user.id : null

  const application = await createWithUniqueRef({
    user_id: userId,
    course_slug: courseSlug,
    course_title: courseTitle,
    full_name: fullName,
    name_with_initials: str(b.nameWithInitials),
    nic,
    dob: str(b.dob),
    gender: str(b.gender) || 'Male',
    email,
    phone,
    address: str(b.address),
    centre,
    qualification: str(b.qualification),
    work_exp: str(b.workExp),
    payment_method: paymentMethod,
    voucher_ref: str(b.voucherRef) || `VOUCHER-${randomDigits()}`,
    amount,
    status: 'Verified' // demo behaviour: payments are not checked against a real bank
  })

  // Signed-in students also get a payment record and an enrollment
  if (userId) {
    await createPayment(
      {
        user_id: userId,
        date: new Date().toISOString().slice(0, 10),
        amount,
        method: paymentMethod === 'online_card' ? 'BOC Online Card IPG' : 'Bank of Ceylon Nawala',
        status: 'Verified'
      },
      str(b.voucherRef) || `BOC-NWL-${randomDigits(1000000, 10000000)}`
    )

    const alreadyEnrolled = await Enrollment.exists({
      user_id: userId,
      $or: [{ course_slug: courseSlug }, { title: courseTitle }]
    })

    if (!alreadyEnrolled) {
      await Enrollment.create({
        user_id: userId,
        course_code: `SC-${courseSlug.slice(0, 10).toUpperCase()}`,
        course_slug: courseSlug,
        title: courseTitle,
        faculty: (course && course.faculty) || 'Faculty of Open & Distance Learning',
        progress: 0,
        next_session: 'Orientation Scheduled - Notice via SMS',
        coordinator: (course && typeof course.coordinator === 'string' && course.coordinator) || 'Course Secretariat',
        status: 'Active',
        modules: DEFAULT_MODULES
      })
    }
  }

  res.status(201).json({
    success: true,
    message: 'Application successfully registered and verified.',
    appRef: application.app_ref,
    applicationId: String(application._id)
  })
}))

// 2. GET /api/applications/my - applications of the signed-in student
router.get('/my', requireAuth, asyncHandler(async (req, res) => {
  const apps = await Application.find({
    $or: [{ user_id: req.user.id }, { email: req.user.email }]
  }).sort({ _id: -1 }).lean()

  res.json({ success: true, applications: apps.map(serialize) })
}))

// 3. GET /api/applications/:ref - one application (owner or admin only)
router.get('/:ref', requireAuth, asyncHandler(async (req, res) => {
  const application = await Application.findOne({ app_ref: req.params.ref }).lean()
  if (!application) {
    return res.status(404).json({ success: false, message: 'Application reference not found.' })
  }

  const isOwner =
    (application.user_id && String(application.user_id) === req.user.id) ||
    application.email.toLowerCase() === req.user.email.toLowerCase()
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(404).json({ success: false, message: 'Application reference not found.' })
  }

  res.json({ success: true, application: serialize(application) })
}))

export default router
