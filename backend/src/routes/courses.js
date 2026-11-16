import { Router } from 'express'
import Course from '../models/Course.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { escapeRegex } from '../lib/text.js'
import { serializeCourse } from '../lib/serialize.js'

const router = Router()

// 1. GET /api/courses  (filters: category, mode, q, sort)
router.get('/', asyncHandler(async (req, res) => {
  const { category, mode, q, sort } = req.query
  const filter = {}

  if (typeof category === 'string' && category && category !== 'All Courses') {
    const rx = new RegExp(escapeRegex(category), 'i')
    filter.$or = [{ category: rx }, { faculty: rx }]
  }

  if (typeof mode === 'string' && mode && mode !== 'All Modes') {
    filter.mode = new RegExp(`^${escapeRegex(mode)}$`, 'i')
  }

  if (typeof q === 'string' && q) {
    const rx = new RegExp(escapeRegex(q), 'i')
    filter.$and = [{ $or: [{ title: rx }, { category: rx }, { short_description: rx }] }]
  }

  let sortBy = { order: 1 }
  if (sort === 'fee-low') sortBy = { fee_num: 1, order: 1 }
  else if (sort === 'fee-high') sortBy = { fee_num: -1, order: 1 }
  else if (sort === 'title') sortBy = { title: 1 }

  const rows = await Course.find(filter).sort(sortBy).lean()
  const courses = rows.map(serializeCourse)

  res.json({ success: true, total: courses.length, courses })
}))

// 2. GET /api/courses/:slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug }).lean()
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' })
  }
  res.json({ success: true, course: serializeCourse(course) })
}))

export default router
