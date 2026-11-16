/**
 * Seed script: fills MongoDB with the course catalogue and demo accounts.
 *
 *   npm run seed             adds anything that is missing (safe to run again)
 *   npm run seed -- --reset  also overwrites the courses with the frontend data
 *
 * The course catalogue is read from frontend/src/data/coursesData.js, so the
 * frontend folder must exist in the repository.
 * Accounts created (emails and passwords come from backend/.env, SEED_* variables):
 *   SEED_SUPERADMIN_*  required - the only way a super admin account is ever created
 *   SEED_ADMIN_*       optional demo admin
 *   SEED_INSTRUCTOR_*  optional demo instructor (assigned to two demo courses)
 *   SEED_STUDENT_*     optional demo student with sample enrollments, grades, payments
 */
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { connectDb, disconnectDb } from '../config/db.js'
import User from '../models/User.js'
import Course from '../models/Course.js'
import Enrollment from '../models/Enrollment.js'
import Material from '../models/Material.js'
import Payment from '../models/Payment.js'
import Announcement from '../models/Announcement.js'
import Grade from '../models/Grade.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const COURSES_FILE = path.resolve(__dirname, '../../../frontend/src/data/coursesData.js')
const RESET = process.argv.includes('--reset')

function stop(message) {
  console.error(`\n[Seed error] ${message}\n`)
  process.exit(1)
}

async function loadCourseData() {
  if (!fs.existsSync(COURSES_FILE)) {
    stop(`Course data file not found:\n  ${COURSES_FILE}\nMake sure the frontend folder is in your branch (merge main first).`)
  }
  const mod = await import(pathToFileURL(COURSES_FILE).href)
  if (!Array.isArray(mod.allShortCourses) || mod.allShortCourses.length === 0) {
    stop('frontend/src/data/coursesData.js does not export a non-empty allShortCourses array.')
  }
  return mod.allShortCourses
}

async function seedCourses() {
  const courses = await loadCourseData()

  const operations = courses.map((c, index) => {
    const { slug, ...fields } = {
      order: c.id || index + 1,
      slug: c.slug,
      title: c.title,
      category: c.category,
      faculty: c.faculty,
      department: c.department || '',
      fee: c.fee,
      fee_num: c.feeNum || 0,
      duration: c.duration || '',
      mode: c.mode || 'Blended',
      language: c.language || 'English',
      intake: c.intake || '',
      featured: Boolean(c.featured),
      image: c.image || '',
      fallback_image: c.fallbackImage || '',
      source_url: c.sourceUrl || '',
      short_description: c.shortDescription || '',
      overview: c.overview || '',
      objectives: c.objectives || [],
      curriculum: c.curriculum || [],
      eligibility: c.eligibility || [],
      career_paths: c.careerPaths || [],
      coordinator: c.coordinator || '',
      payment_account: c.paymentAccount || ''
    }
    return {
      updateOne: {
        filter: { slug },
        update: RESET ? { $set: fields } : { $setOnInsert: fields },
        upsert: true
      }
    }
  })

  await Course.bulkWrite(operations)
  const total = await Course.countDocuments()
  console.log(`  courses in database: ${total} (${RESET ? 'overwritten from frontend data' : 'missing ones added'})`)
}

async function ensureUser({ email, password, full_name, phone, nic, role, ...profile }) {
  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    console.log(`  = ${role} already exists: ${email}`)
    return existing
  }
  const user = await User.create({
    full_name,
    email,
    phone,
    nic,
    role,
    ...profile,
    must_change_password: false, // demo accounts can be used straight away
    password_hash: await bcrypt.hash(password, 12)
  })
  console.log(`  + ${role} created: ${email}`)
  return user
}

const hasCredentials = (email, password) => Boolean(email) && password.length >= 8

async function seedDemoData(student, admin) {
  const marketing = await Course.findOne({ slug: 'short-course-in-marketing-analytics-online' }).lean()
  const python = await Course.findOne({ title: /python for beginners/i }).lean()

  const demoEnrollments = [
    {
      course: marketing,
      fallbackTitle: 'Short Course in Marketing Analytics (Online)',
      code: 'SC-MA-2026',
      faculty: 'Faculty of Management Studies',
      progress: 68,
      nextSession: 'Saturday, 10:00 AM - 1:00 PM (Zoom Live)',
      coordinator: 'Dr. V. Sivalogathasan',
      modules: [
        'Descriptive Analytics in Marketing',
        'Consumer Behavior Predictive Modeling',
        'Google Analytics 4 & Power BI',
        'Capstone Applied Analytics Project'
      ],
      materials: [
        { name: 'Unit 1: Foundations of Marketing Analytics Study Pack.pdf', size: '4.2 MB', file_path: '/docs/materials/marketing-pack-1.pdf' },
        { name: 'Unit 2: Customer Segmentation & Clustering Datasets.zip', size: '12.8 MB', file_path: '/docs/materials/customer-datasets.zip' }
      ],
      payment: { ref: 'BOC-NWL-7417821-891', date: '2026-10-12', amount: 'Rs. 20,000', method: 'Bank of Ceylon Nawala' },
      grade: { assignment: 'Continuous Assessment 1 (Quiz)', marks: 88, grade: 'A', remarks: 'Strong grasp of foundational marketing metrics.' }
    },
    {
      course: python,
      fallbackTitle: 'Short Course in Python for Beginners',
      code: 'SC-PY-2026',
      faculty: 'Faculty of Engineering Technology',
      progress: 35,
      nextSession: 'Sunday, 9:00 AM - 1:00 PM (Lab 02, Nawala CRC)',
      coordinator: 'Ms. Sachini De Alwis',
      modules: [
        'Python Syntax & Data Structures',
        'Functions & Modular Design',
        'Pandas & Data Manipulation',
        'Automating Tasks with Python'
      ],
      materials: [
        { name: 'Python Lab Sheet 03: Control Structures & Loops.pdf', size: '1.8 MB', file_path: '/docs/materials/python-lab-03.pdf' },
        { name: 'Day School Recorded Lecture 04: Functional Programming.mp4', size: '142 MB', file_path: '/docs/materials/lecture-04.mp4' }
      ],
      payment: { ref: 'BOC-NWL-7417821-654', date: '2026-08-28', amount: 'Rs. 22,500', method: 'BOC Online Card IPG' },
      grade: { assignment: 'Lab Practical 01: Python Basics', marks: 94, grade: 'A+', remarks: 'Clean syntax and modular program structure.' }
    }
  ]

  for (const d of demoEnrollments) {
    const title = d.course ? d.course.title : d.fallbackTitle
    const slug = d.course ? d.course.slug : ''

    const enrollment = await Enrollment.findOneAndUpdate(
      { user_id: student._id, title },
      {
        $setOnInsert: {
          course_code: d.code,
          course_slug: slug,
          faculty: d.faculty,
          progress: d.progress,
          next_session: d.nextSession,
          coordinator: d.coordinator,
          status: 'Active',
          modules: d.modules
        }
      },
      { upsert: true, new: true }
    )

    for (const m of d.materials) {
      await Material.updateOne(
        { course_title: title, name: m.name },
        { $setOnInsert: { size: m.size, file_path: m.file_path } },
        { upsert: true }
      )
    }

    await Payment.updateOne(
      { ref: d.payment.ref },
      { $setOnInsert: { user_id: student._id, date: d.payment.date, amount: d.payment.amount, method: d.payment.method, status: 'Verified' } },
      { upsert: true }
    )

    await Grade.updateOne(
      { student_id: student._id, assignment: d.grade.assignment },
      {
        $setOnInsert: {
          enrollment_id: enrollment._id,
          marks: d.grade.marks,
          max_marks: 100,
          grade: d.grade.grade,
          remarks: d.grade.remarks,
          graded_by: admin._id
        }
      },
      { upsert: true }
    )
  }

  console.log('  demo enrollments, materials, payments and grades are in place')
}

async function seedAnnouncements(admin) {
  const python = await Course.findOne({ title: /python for beginners/i }).select('slug').lean()
  const items = [
    {
      title: 'Orientation Day School for Batch 2026',
      body: 'All enrolled students in Short Courses are invited to attend the Virtual Orientation Day School on Saturday at 9:00 AM via Zoom LMS.',
      audience: 'all',
      course_slug: null
    },
    {
      title: 'Python for Beginners: Assignment 1 Released',
      body: 'Assignment 01 on Control Flow and Functions is now available under Study Packs. Submission deadline is November 20th, 2026.',
      audience: 'course',
      course_slug: python ? python.slug : null
    }
  ]
  for (const a of items) {
    await Announcement.updateOne(
      { title: a.title },
      { $setOnInsert: { body: a.body, audience: a.audience, course_slug: a.course_slug, author_id: admin._id, author_name: admin.full_name } },
      { upsert: true }
    )
  }
  console.log('  announcements are in place')
}

async function main() {
  const env = process.env
  const superEmail = (env.SEED_SUPERADMIN_EMAIL || '').trim()
  const superPassword = env.SEED_SUPERADMIN_PASSWORD || ''
  const adminEmail = (env.SEED_ADMIN_EMAIL || '').trim()
  const adminPassword = env.SEED_ADMIN_PASSWORD || ''
  const instructorEmail = (env.SEED_INSTRUCTOR_EMAIL || '').trim()
  const instructorPassword = env.SEED_INSTRUCTOR_PASSWORD || ''
  const studentEmail = (env.SEED_STUDENT_EMAIL || '').trim()
  const studentPassword = env.SEED_STUDENT_PASSWORD || ''

  console.log('--- OUSL database seed ---')
  await connectDb()

  if (!hasCredentials(superEmail, superPassword)) {
    stop('Set SEED_SUPERADMIN_EMAIL and SEED_SUPERADMIN_PASSWORD (at least 8 characters) in backend/.env first.')
  }

  console.log('Courses')
  await seedCourses()

  console.log('Accounts')
  const superAdmin = await ensureUser({
    email: superEmail,
    password: superPassword,
    full_name: 'OUSL Super Administrator',
    phone: '011 2881000',
    nic: '',
    role: 'superadmin'
  })

  if (hasCredentials(adminEmail, adminPassword)) {
    await ensureUser({
      email: adminEmail,
      password: adminPassword,
      full_name: 'OUSL Administrator',
      phone: '011 2881001',
      nic: '',
      role: 'admin',
      created_by: superAdmin._id
    })
  } else {
    console.log('  (no demo admin: SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set or password shorter than 8)')
  }

  if (hasCredentials(instructorEmail, instructorPassword)) {
    const instructor = await ensureUser({
      email: instructorEmail,
      password: instructorPassword,
      full_name: 'Dr. V. Sivalogathasan',
      phone: '011 2881002',
      nic: '',
      role: 'instructor',
      title: 'Senior Lecturer',
      department: 'Department of Management Studies',
      qualifications: 'PhD in Marketing Analytics, MBA',
      bio: 'Demo instructor account used to try out role-based access.',
      public_profile: true,
      created_by: superAdmin._id
    })
    const demoCourses = await Course.find({
      $or: [{ slug: 'short-course-in-marketing-analytics-online' }, { title: /python for beginners/i }]
    }).select('_id').lean()
    for (const c of demoCourses) {
      await Course.updateOne({ _id: c._id }, { $addToSet: { instructors: instructor._id } })
    }
    console.log(`  demo instructor is assigned to ${demoCourses.length} course(s)`)
  } else {
    console.log('  (no demo instructor: SEED_INSTRUCTOR_EMAIL / SEED_INSTRUCTOR_PASSWORD not set or password shorter than 8)')
  }

  let student = null
  if (hasCredentials(studentEmail, studentPassword)) {
    student = await ensureUser({
      email: studentEmail,
      password: studentPassword,
      full_name: 'Saman Kumara',
      phone: '071 2345678',
      nic: '',
      role: 'student'
    })
  } else {
    console.log('  (no demo student: SEED_STUDENT_EMAIL / SEED_STUDENT_PASSWORD not set or password shorter than 8)')
  }

  console.log('Demo content')
  await seedAnnouncements(superAdmin)
  if (student) await seedDemoData(student, superAdmin)

  console.log('--- Seed finished. Sign in with the emails above and the passwords from your .env ---')
}

main()
  .then(async () => {
    await disconnectDb()
    process.exit(0)
  })
  .catch((err) => {
    console.error('Seed error:', err)
    process.exit(1)
  })
