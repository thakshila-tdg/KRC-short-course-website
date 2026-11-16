/**
 * Staff API routes (instructor, admin and super admin).
 * Mounted at /api/admin
 *
 * Every route checks a permission from config/permissions.js.
 * Instructors are additionally limited to the courses assigned to them
 * (see lib/scope.js): their lists only contain those courses and the people,
 * materials, announcements and grades that belong to them.
 */
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import Material from '../models/Material.js'
import Announcement from '../models/Announcement.js'
import Grade from '../models/Grade.js'
import { requireAuth, requireStaff, requirePermission } from '../middleware/auth.js'
import { hasPermission } from '../config/permissions.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { serialize, serializeMany, serializeCourse } from '../lib/serialize.js'
import { str, toList } from '../lib/text.js'
import { getScope, enrollmentFilterFor, ownsCourse, nameInScope } from '../lib/scope.js'
import { profileFields, PROFILE_SELECT } from '../lib/profile.js'
import staffRoutes from './adminStaff.js'

const router = Router()

router.use(requireAuth)
router.use(requireStaff)
router.use('/staff', staffRoutes)

const isId = (value) => mongoose.isObjectIdOrHexString(value)
const notFound = (res, what) => res.status(404).json({ success: false, message: `${what} not found.` })
const forbidden = (res, message) => res.status(403).json({ success: false, message })

// Course fields only admins and super admins may change (instructors edit content only)
const DETAIL_FIELDS = new Set(['title', 'category', 'faculty', 'department', 'fee', 'fee_num', 'mode', 'language', 'coordinator'])

const sameValue = (a, b) => String(a ?? '').trim() === String(b ?? '').trim()

// Adds full_name, email, phone and nic of the owning user to enrollment-like rows
async function withUsers(rows) {
  const ids = [...new Set(rows.map((r) => String(r.user_id)))]
  const users = ids.length ? await User.find({ _id: { $in: ids } }).select('full_name email phone nic').lean() : []
  const byId = new Map(users.map((u) => [String(u._id), u]))
  return rows.map((r) => {
    const u = byId.get(String(r.user_id)) || {}
    return {
      ...serialize(r),
      full_name: u.full_name || '',
      email: u.email || '',
      phone: u.phone || '',
      nic: u.nic || ''
    }
  })
}

// Serialized courses with a short list of their instructors
async function withInstructors(courses) {
  const ids = [...new Set(courses.flatMap((c) => (c.instructors || []).map(String)))]
  const users = ids.length ? await User.find({ _id: { $in: ids } }).select('full_name title').lean() : []
  const byId = new Map(users.map((u) => [String(u._id), { id: String(u._id), full_name: u.full_name, title: u.title || '' }]))
  return courses.map((c) => ({
    ...serializeCourse(c),
    instructors: (c.instructors || []).map((i) => byId.get(String(i))).filter(Boolean)
  }))
}

// Converts the camelCase body sent by the admin form into snake_case course fields
function courseFields(body) {
  const out = {}
  const textFields = {
    title: 'title',
    category: 'category',
    faculty: 'faculty',
    fee: 'fee',
    duration: 'duration',
    mode: 'mode',
    intake: 'intake',
    overview: 'overview',
    image: 'image',
    language: 'language',
    department: 'department',
    coordinator: 'coordinator',
    shortDescription: 'short_description',
    fallbackImage: 'fallback_image'
  }
  for (const [key, field] of Object.entries(textFields)) {
    if (body[key] !== undefined && body[key] !== null) out[field] = String(body[key]).trim()
  }
  if (body.feeNum !== undefined) out.fee_num = Number(body.feeNum) || 0
  const lists = { objectives: 'objectives', curriculum: 'curriculum', eligibility: 'eligibility', careerPaths: 'career_paths' }
  for (const [key, field] of Object.entries(lists)) {
    if (body[key] !== undefined) out[field] = toList(body[key])
  }
  return out
}

// Announcements an instructor may see: their own or for their courses
const announcementFilterFor = (scope, user) =>
  scope.restricted ? { $or: [{ author_id: user.id }, { course_slug: { $in: scope.slugs } }] } : {}

const materialFilterFor = (scope) => (scope.restricted ? { course_title: { $in: scope.names } } : {})

/* 1. DASHBOARD */
router.get('/dashboard', requirePermission('dashboard:view'), asyncHandler(async (req, res) => {
  const scope = await getScope(req.user)
  const enrollments = await Enrollment.find(enrollmentFilterFor(scope)).sort({ _id: -1 }).lean()
  const annFilter = announcementFilterFor(scope, req.user)

  const gradeFilter = scope.restricted ? { enrollment_id: { $in: enrollments.map((e) => String(e._id)) } } : {}

  const [totalCourses, totalStudents, totalMaterials, totalAnnouncements, totalGrades, recentAnnouncements] = await Promise.all([
    scope.restricted ? scope.courses.length : Course.countDocuments(),
    scope.restricted ? new Set(enrollments.map((e) => String(e.user_id))).size : User.countDocuments({ role: 'student' }),
    Material.countDocuments(materialFilterFor(scope)),
    Announcement.countDocuments(annFilter),
    Grade.countDocuments(gradeFilter),
    Announcement.find(annFilter).sort({ created_at: -1 }).limit(5).lean()
  ])

  res.json({
    success: true,
    stats: {
      totalCourses,
      totalStudents,
      totalEnrollments: enrollments.length,
      totalMaterials,
      totalAnnouncements,
      totalGrades
    },
    recentAnnouncements: serializeMany(recentAnnouncements),
    recentEnrollments: await withUsers(enrollments.slice(0, 5))
  })
}))

/* 2. COURSES */
router.get('/courses', requirePermission('course:view'), asyncHandler(async (req, res) => {
  const scope = await getScope(req.user)
  const [rows, enrollments] = await Promise.all([
    scope.restricted ? scope.courses : Course.find().sort({ order: 1 }).lean(),
    Enrollment.find(enrollmentFilterFor(scope)).select('title course_slug course_code').lean()
  ])

  const courses = (await withInstructors(rows)).map((c) => ({
    ...c,
    enrolledCount: enrollments.filter(
      (e) => e.course_slug === c.slug || e.course_code === c.slug || e.title === c.title
    ).length
  }))

  res.json({ success: true, total: courses.length, courses })
}))

router.post('/courses', requirePermission('course:create'), asyncHandler(async (req, res) => {
  const body = req.body || {}
  const slug = str(body.slug)
  const fields = courseFields(body)

  if (!slug || !fields.title || !fields.category || !fields.faculty || !fields.fee) {
    return res.status(400).json({ success: false, message: 'slug, title, category, faculty, and fee are required.' })
  }
  if (await Course.exists({ slug })) {
    return res.status(409).json({ success: false, message: 'A course with this slug already exists.' })
  }

  const last = await Course.findOne().sort({ order: -1 }).select('order').lean()
  const course = await Course.create({
    mode: 'Blended',
    ...fields,
    slug,
    order: (last ? last.order : 0) + 1
  })

  res.status(201).json({ success: true, message: 'Course created successfully.', course: serializeCourse(course) })
}))

router.put('/courses/:slug', requirePermission('course:edit_content'), asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
  if (!course) return notFound(res, 'Course')

  const scope = await getScope(req.user)
  if (!ownsCourse(scope, course)) {
    return forbidden(res, 'You can only edit courses that are assigned to you.')
  }

  const fields = courseFields(req.body || {})

  // Without the "edit details" permission only content and information fields may change.
  // The edit form sends every field, so unchanged details are simply ignored.
  if (!hasPermission(req.user.role, 'course:edit_details')) {
    const blocked = Object.keys(fields).filter((f) => DETAIL_FIELDS.has(f) && !sameValue(course[f], fields[f]))
    if (blocked.length) {
      return forbidden(res, `You can edit course content only. You cannot change: ${blocked.join(', ')}.`)
    }
    for (const f of DETAIL_FIELDS) delete fields[f]
  }

  Object.assign(course, fields)
  await course.save()
  const [saved] = await withInstructors([course.toObject()])
  res.json({ success: true, message: 'Course updated successfully.', course: saved })
}))

router.put('/courses/:slug/instructors', requirePermission('course:assign_instructors'), asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug })
  if (!course) return notFound(res, 'Course')

  const ids = Array.isArray((req.body || {}).instructorIds) ? req.body.instructorIds.map(String) : []
  if (!ids.every(isId)) {
    return res.status(400).json({ success: false, message: 'instructorIds must be a list of valid ids.' })
  }
  const found = ids.length ? await User.find({ _id: { $in: ids }, role: 'instructor' }).select('_id').lean() : []
  if (found.length !== new Set(ids).size) {
    return res.status(400).json({ success: false, message: 'Every id must belong to an instructor account.' })
  }

  course.instructors = found.map((u) => u._id)
  await course.save()
  const [saved] = await withInstructors([course.toObject()])
  res.json({ success: true, message: 'Instructors assigned.', course: saved })
}))

router.delete('/courses/:slug', requirePermission('course:delete'), asyncHandler(async (req, res) => {
  const result = await Course.deleteOne({ slug: req.params.slug })
  if (result.deletedCount === 0) return notFound(res, 'Course')
  res.json({ success: true, message: 'Course deleted successfully.' })
}))

/* 3. STUDENTS & ENROLLMENTS */
router.get('/students', requirePermission('student:view'), asyncHandler(async (req, res) => {
  const scope = await getScope(req.user)
  const filter = { role: 'student' }

  if (scope.restricted) {
    const enrollments = await Enrollment.find(enrollmentFilterFor(scope)).select('user_id').lean()
    filter._id = { $in: [...new Set(enrollments.map((e) => String(e.user_id)))] }
  }

  const students = await User.find(filter).select(PROFILE_SELECT).sort({ _id: 1 }).lean()
  res.json({ success: true, total: students.length, students: serializeMany(students) })
}))

router.get('/courses/:slug/students', requirePermission('student:view'), asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug }).lean()
  if (!course) return notFound(res, 'Course')

  const scope = await getScope(req.user)
  if (!ownsCourse(scope, course)) {
    return forbidden(res, 'You can only view students of courses assigned to you.')
  }

  const rows = await Enrollment.find({
    $or: [{ title: course.title }, { course_slug: req.params.slug }, { course_code: req.params.slug }]
  }).sort({ _id: 1 }).lean()

  const [courseOut] = await withInstructors([course])
  res.json({ success: true, course: courseOut, enrollments: await withUsers(rows) })
}))

/* 4. MATERIALS */
router.get('/materials', requirePermission('material:manage'), asyncHandler(async (req, res) => {
  const scope = await getScope(req.user)
  const materials = await Material.find(materialFilterFor(scope)).sort({ _id: -1 }).lean()
  res.json({ success: true, total: materials.length, materials: serializeMany(materials) })
}))

router.post('/materials', requirePermission('material:manage'), asyncHandler(async (req, res) => {
  const b = req.body || {}
  const courseTitle = str(b.courseTitleOrSlug)
  const name = str(b.name)
  if (!courseTitle || !name) {
    return res.status(400).json({ success: false, message: 'course and name are required.' })
  }

  const scope = await getScope(req.user)
  if (!nameInScope(scope, courseTitle)) {
    return forbidden(res, 'You can only add materials to courses assigned to you.')
  }

  const material = await Material.create({
    course_title: courseTitle,
    name,
    size: str(b.size) || 'N/A',
    file_path: str(b.filePath)
  })
  res.status(201).json({ success: true, message: 'Material added.', material: serialize(material) })
}))

router.put('/materials/:id', requirePermission('material:manage'), asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return notFound(res, 'Material')
  const material = await Material.findById(req.params.id)
  if (!material) return notFound(res, 'Material')

  const scope = await getScope(req.user)
  const b = req.body || {}
  if (!nameInScope(scope, material.course_title) ||
      (b.courseTitleOrSlug !== undefined && !nameInScope(scope, str(b.courseTitleOrSlug)))) {
    return forbidden(res, 'You can only change materials of courses assigned to you.')
  }

  if (b.courseTitleOrSlug !== undefined) material.course_title = str(b.courseTitleOrSlug)
  if (b.name !== undefined) material.name = str(b.name)
  if (b.size !== undefined) material.size = str(b.size) || 'N/A'
  if (b.filePath !== undefined) material.file_path = str(b.filePath)
  await material.save()
  res.json({ success: true, message: 'Material updated.', material: serialize(material) })
}))

router.delete('/materials/:id', requirePermission('material:manage'), asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return notFound(res, 'Material')
  const material = await Material.findById(req.params.id).lean()
  if (!material) return notFound(res, 'Material')

  const scope = await getScope(req.user)
  if (!nameInScope(scope, material.course_title)) {
    return forbidden(res, 'You can only delete materials of courses assigned to you.')
  }

  await Material.deleteOne({ _id: req.params.id })
  res.json({ success: true, message: 'Material deleted.' })
}))

/* 5. ANNOUNCEMENTS */
router.get('/announcements', requirePermission('announcement:manage'), asyncHandler(async (req, res) => {
  const scope = await getScope(req.user)
  const announcements = await Announcement.find(announcementFilterFor(scope, req.user)).sort({ created_at: -1 }).lean()
  res.json({ success: true, total: announcements.length, announcements: serializeMany(announcements) })
}))

router.post('/announcements', requirePermission('announcement:manage'), asyncHandler(async (req, res) => {
  const b = req.body || {}
  const title = str(b.title)
  const body = str(b.body)
  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'title and body are required.' })
  }

  const audience = str(b.audience) || 'all'
  const courseSlug = str(b.courseSlug) || null

  const scope = await getScope(req.user)
  if (scope.restricted && (audience !== 'course' || !courseSlug || !scope.slugs.includes(courseSlug))) {
    return forbidden(res, 'Instructors can only post announcements to their own courses.')
  }

  const announcement = await Announcement.create({
    title,
    body,
    audience,
    course_slug: courseSlug,
    author_id: req.user.id,
    author_name: req.user.full_name
  })
  res.status(201).json({ success: true, message: 'Announcement posted.', announcement: serialize(announcement) })
}))

router.put('/announcements/:id', requirePermission('announcement:manage'), asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return notFound(res, 'Announcement')
  const announcement = await Announcement.findById(req.params.id)
  if (!announcement) return notFound(res, 'Announcement')

  const scope = await getScope(req.user)
  const b = req.body || {}
  if (scope.restricted) {
    if (String(announcement.author_id) !== req.user.id) {
      return forbidden(res, 'You can only change your own announcements.')
    }
    const newAudience = b.audience !== undefined ? str(b.audience) || 'all' : announcement.audience
    const newSlug = b.courseSlug !== undefined ? str(b.courseSlug) || null : announcement.course_slug
    if (newAudience !== 'course' || !newSlug || !scope.slugs.includes(newSlug)) {
      return forbidden(res, 'Instructors can only post announcements to their own courses.')
    }
  }

  if (b.title !== undefined) announcement.title = str(b.title)
  if (b.body !== undefined) announcement.body = str(b.body)
  if (b.audience !== undefined) announcement.audience = str(b.audience) || 'all'
  if (b.courseSlug !== undefined) announcement.course_slug = str(b.courseSlug) || null
  await announcement.save()
  res.json({ success: true, message: 'Announcement updated.', announcement: serialize(announcement) })
}))

router.delete('/announcements/:id', requirePermission('announcement:manage'), asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return notFound(res, 'Announcement')
  const announcement = await Announcement.findById(req.params.id).lean()
  if (!announcement) return notFound(res, 'Announcement')

  const scope = await getScope(req.user)
  if (scope.restricted && String(announcement.author_id) !== req.user.id) {
    return forbidden(res, 'You can only delete your own announcements.')
  }

  await Announcement.deleteOne({ _id: req.params.id })
  res.json({ success: true, message: 'Announcement deleted.' })
}))

/* 6. GRADES */
router.get('/grades', requirePermission('grade:manage'), asyncHandler(async (req, res) => {
  const scope = await getScope(req.user)
  let filter = {}
  if (scope.restricted) {
    const enrollments = await Enrollment.find(enrollmentFilterFor(scope)).select('_id').lean()
    filter = { enrollment_id: { $in: enrollments.map((e) => String(e._id)) } }
  }
  const grades = await Grade.find(filter).sort({ _id: -1 }).lean()

  const studentIds = [...new Set(grades.map((g) => String(g.student_id)))]
  const enrollmentIds = [...new Set(grades.filter((g) => g.enrollment_id).map((g) => String(g.enrollment_id)))]
  const [users, enrollments] = await Promise.all([
    studentIds.length ? User.find({ _id: { $in: studentIds } }).select('full_name email').lean() : [],
    enrollmentIds.length ? Enrollment.find({ _id: { $in: enrollmentIds } }).select('title course_code').lean() : []
  ])
  const userById = new Map(users.map((u) => [String(u._id), u]))
  const enrollmentById = new Map(enrollments.map((e) => [String(e._id), e]))

  const rows = grades.map((g) => {
    const u = userById.get(String(g.student_id)) || {}
    const e = enrollmentById.get(String(g.enrollment_id)) || {}
    return {
      ...serialize(g),
      full_name: u.full_name || '',
      email: u.email || '',
      course_title: e.title || '',
      course_code: e.course_code || ''
    }
  })

  res.json({ success: true, total: rows.length, grades: rows })
}))

router.post('/grades', requirePermission('grade:manage'), asyncHandler(async (req, res) => {
  const b = req.body || {}
  const assignment = str(b.assignment)
  if (!b.studentId || !assignment) {
    return res.status(400).json({ success: false, message: 'studentId and assignment are required.' })
  }
  if (!isId(b.studentId)) return notFound(res, 'Student')

  const student = await User.findOne({ _id: b.studentId, role: 'student' }).select('_id').lean()
  if (!student) return notFound(res, 'Student')

  const marks = b.marks === undefined || b.marks === '' ? 0 : Number(b.marks)
  const maxMarks = b.maxMarks === undefined || b.maxMarks === '' ? 100 : Number(b.maxMarks)
  if (!Number.isFinite(marks) || !Number.isFinite(maxMarks) || marks < 0 || maxMarks <= 0) {
    return res.status(400).json({ success: false, message: 'marks and maxMarks must be valid numbers.' })
  }

  // Use the enrollment the form sent when it belongs to this student (and, for instructors,
  // to one of their courses); otherwise the student's most recent matching enrollment.
  const scope = await getScope(req.user)
  const candidates = await Enrollment.find({ user_id: student._id, ...enrollmentFilterFor(scope) }).sort({ _id: -1 }).select('_id').lean()
  let enrollment = null
  if (b.enrollmentId && isId(b.enrollmentId)) {
    enrollment = candidates.find((e) => String(e._id) === String(b.enrollmentId)) || null
  }
  if (!enrollment) enrollment = candidates[0] || null

  if (scope.restricted && !enrollment) {
    return forbidden(res, 'This student is not enrolled in one of your courses.')
  }

  const grade = await Grade.create({
    student_id: student._id,
    enrollment_id: enrollment ? enrollment._id : null,
    assignment,
    marks,
    max_marks: maxMarks,
    grade: str(b.grade),
    remarks: str(b.remarks),
    graded_by: req.user.id
  })

  res.status(201).json({ success: true, message: 'Grade added.', grade: serialize(grade) })
}))

// Instructors may only touch grades that belong to enrollments in their courses
async function gradeInScope(scope, grade) {
  if (!scope.restricted) return true
  if (!grade.enrollment_id) return false
  const match = await Enrollment.findOne({ _id: grade.enrollment_id, ...enrollmentFilterFor(scope) }).select('_id').lean()
  return Boolean(match)
}

router.put('/grades/:id', requirePermission('grade:manage'), asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return notFound(res, 'Grade')
  const grade = await Grade.findById(req.params.id)
  if (!grade) return notFound(res, 'Grade')

  const scope = await getScope(req.user)
  if (!(await gradeInScope(scope, grade))) {
    return forbidden(res, 'You can only change grades of students in your courses.')
  }

  const b = req.body || {}
  const marks = b.marks !== undefined && b.marks !== '' ? Number(b.marks) : undefined
  const maxMarks = b.maxMarks !== undefined && b.maxMarks !== '' ? Number(b.maxMarks) : undefined
  if ((marks !== undefined && !Number.isFinite(marks)) || (maxMarks !== undefined && !Number.isFinite(maxMarks))) {
    return res.status(400).json({ success: false, message: 'marks and maxMarks must be valid numbers.' })
  }

  if (b.assignment !== undefined) grade.assignment = str(b.assignment)
  if (marks !== undefined) grade.marks = marks
  if (maxMarks !== undefined) grade.max_marks = maxMarks
  if (b.grade !== undefined) grade.grade = str(b.grade)
  if (b.remarks !== undefined) grade.remarks = str(b.remarks)
  await grade.save()
  res.json({ success: true, message: 'Grade updated.', grade: serialize(grade) })
}))

router.delete('/grades/:id', requirePermission('grade:manage'), asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) return notFound(res, 'Grade')
  const grade = await Grade.findById(req.params.id).lean()
  if (!grade) return notFound(res, 'Grade')

  const scope = await getScope(req.user)
  if (!(await gradeInScope(scope, grade))) {
    return forbidden(res, 'You can only delete grades of students in your courses.')
  }

  await Grade.deleteOne({ _id: req.params.id })
  res.json({ success: true, message: 'Grade deleted.' })
}))

/* 7. MY PROFILE (every staff role) */
router.get('/profile', requirePermission('profile:self'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(PROFILE_SELECT).lean()
  res.json({ success: true, user: serialize(user) })
}))

router.put('/profile', requirePermission('profile:self'), asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { $set: profileFields(req.body || {}) }, { new: true, runValidators: true })
    .select(PROFILE_SELECT)
    .lean()
  res.json({ success: true, message: 'Profile updated.', user: serialize(user) })
}))

router.post('/profile/change-password', requirePermission('profile:self'), asyncHandler(async (req, res) => {
  const b = req.body || {}
  const currentPassword = typeof b.currentPassword === 'string' ? b.currentPassword : ''
  const newPassword = typeof b.newPassword === 'string' ? b.newPassword : ''

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' })
  }
  if (newPassword.length > 128) {
    return res.status(400).json({ success: false, message: 'New password must be at most 128 characters.' })
  }

  const user = await User.findById(req.user.id)
  const isValid = await bcrypt.compare(currentPassword, user.password_hash)
  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' })
  }

  user.password_hash = await bcrypt.hash(newPassword, 12)
  user.must_change_password = false
  await user.save()
  res.json({ success: true, message: 'Password changed successfully.' })
}))

export default router
