import { Router } from 'express'
import Inquiry from '../models/Inquiry.js'
import { requirePermission } from '../middleware/auth.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { serialize } from '../lib/serialize.js'
import { str, randomDigits } from '../lib/text.js'

const router = Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function createWithUniqueTicket(data) {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await Inquiry.create({ ...data, ticket_ref: `OUSL-INQ-${randomDigits()}` })
    } catch (err) {
      const duplicate = err.code === 11000 && err.keyPattern && err.keyPattern.ticket_ref
      if (!duplicate) throw err
    }
  }
  throw new Error('Could not generate a unique ticket reference. Please try again.')
}

// 1. POST /api/inquiries - submit an inquiry, consultation or career application
router.post('/', asyncHandler(async (req, res) => {
  const b = req.body || {}
  const fullName = str(b.fullName)
  const email = str(b.email)
  const message = str(b.message)

  if (!fullName || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message content are required.' })
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
  }

  const inquiry = await createWithUniqueTicket({
    full_name: fullName,
    email,
    phone: str(b.phone),
    course: str(b.course),
    centre: str(b.centre) || 'Colombo Regional Centre (Nawala)',
    subject: str(b.subject) || 'General Short Course Inquiry',
    message
  })

  res.status(201).json({
    success: true,
    message: 'Your inquiry has been successfully lodged with OUSL Admissions & Public Information Office.',
    ticketRef: inquiry.ticket_ref
  })
}))

// 2. GET /api/inquiries - list inquiries (admin and super admin)
router.get('/', requirePermission('inquiry:view'), asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ _id: -1 }).lean()
  res.json({ success: true, inquiries: inquiries.map(serialize) })
}))

export default router
