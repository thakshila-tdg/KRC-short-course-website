/**
 * Smoke test: checks that the running API answers correctly.
 *
 * 1. Start the backend in one terminal:   npm run dev
 * 2. Run this in a second terminal:       npm run test:smoke
 *
 * It signs in with the SEED_* accounts from backend/.env, so run "npm run seed" first.
 * Role checks run when SEED_ADMIN_* and SEED_INSTRUCTOR_* demo accounts exist.
 * Note: the login endpoint allows about 20 attempts per 15 minutes per IP address.
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`
const results = []

async function call(method, route, { token, body } = {}) {
  const res = await fetch(BASE + route, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    body: body ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => null)
  return { status: res.status, data }
}

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

async function check(name, fn) {
  try {
    await fn()
    results.push({ name, ok: true })
  } catch (err) {
    results.push({ name, ok: false, error: err.message })
  }
}

let adminToken = null
let studentToken = null
let firstSlug = null

await check('GET /health reports database connected', async () => {
  const { status, data } = await call('GET', '/health')
  expect(status === 200, `status ${status}`)
  expect(data.database === 'connected', `database is "${data.database}"`)
})

await check('GET /courses returns the catalogue', async () => {
  const { status, data } = await call('GET', '/courses')
  expect(status === 200, `status ${status}`)
  expect(data.total > 0, 'no courses found (run: npm run seed)')
  firstSlug = data.courses[0].slug
  expect(data.courses[0].id && data.courses[0].feeNum !== undefined, 'course shape is wrong')
})

await check('GET /courses?q=python filters by text', async () => {
  const { status, data } = await call('GET', '/courses?q=python')
  expect(status === 200, `status ${status}`)
  expect(Array.isArray(data.courses), 'courses is not an array')
})

await check('GET /courses/:slug returns one course', async () => {
  expect(firstSlug, 'no slug from previous step')
  const { status, data } = await call('GET', `/courses/${firstSlug}`)
  expect(status === 200 && data.course.slug === firstSlug, `status ${status}`)
})

await check('GET /courses/unknown returns 404', async () => {
  const { status } = await call('GET', '/courses/this-course-does-not-exist')
  expect(status === 404, `status ${status}`)
})

await check('Super admin login works and returns permissions', async () => {
  const { status, data } = await call('POST', '/auth/login', {
    body: { email: process.env.SEED_SUPERADMIN_EMAIL, password: process.env.SEED_SUPERADMIN_PASSWORD, expectedRole: 'admin' }
  })
  expect(status === 200, `status ${status}: ${data && data.message}`)
  adminToken = data.token
  expect(data.user.role === 'superadmin', `role is ${data.user.role}`)
  expect(data.user.permissions.includes('staff:create_admin'), 'permissions list is missing staff:create_admin')
})

await check('Student login works', async () => {
  const { status, data } = await call('POST', '/auth/login', {
    body: { email: process.env.SEED_STUDENT_EMAIL, password: process.env.SEED_STUDENT_PASSWORD, expectedRole: 'student' }
  })
  expect(status === 200, `status ${status}: ${data && data.message}`)
  studentToken = data.token
})

await check('Wrong password is rejected (401)', async () => {
  const { status } = await call('POST', '/auth/login', {
    body: { email: process.env.SEED_STUDENT_EMAIL, password: 'definitely-wrong-password' }
  })
  expect(status === 401, `status ${status}`)
})

await check('GET /auth/me returns the signed-in user', async () => {
  const { status, data } = await call('GET', '/auth/me', { token: studentToken })
  expect(status === 200 && data.user.email, `status ${status}`)
})

await check('Student dashboard has profile, enrolled, materials, payments', async () => {
  const { status, data } = await call('GET', '/student/dashboard', { token: studentToken })
  expect(status === 200, `status ${status}`)
  expect(data.profile && Array.isArray(data.enrolled) && Array.isArray(data.materials) && Array.isArray(data.payments), 'shape is wrong')
})

await check('Student dashboard without login is blocked (401)', async () => {
  const { status } = await call('GET', '/student/dashboard')
  expect(status === 401, `status ${status}`)
})

await check('Student cannot open admin routes (403)', async () => {
  const { status } = await call('GET', '/admin/dashboard', { token: studentToken })
  expect(status === 403, `status ${status}`)
})

await check('Super admin dashboard has statistics', async () => {
  const { status, data } = await call('GET', '/admin/dashboard', { token: adminToken })
  expect(status === 200 && data.stats.totalCourses > 0, `status ${status}`)
})

await check('Super admin lists students, courses, materials, announcements, grades, staff', async () => {
  for (const route of ['/admin/students', '/admin/courses', '/admin/materials', '/admin/announcements', '/admin/grades', '/admin/staff']) {
    const { status } = await call('GET', route, { token: adminToken })
    expect(status === 200, `${route} returned ${status}`)
  }
})

await check('POST /inquiries creates a ticket', async () => {
  const { status, data } = await call('POST', '/inquiries', {
    body: { fullName: 'Smoke Test', email: 'smoke@example.com', message: 'Automated smoke test message.' }
  })
  expect(status === 201 && data.ticketRef, `status ${status}`)
})

await check('POST /auth/forgot-password answers successfully', async () => {
  const { status, data } = await call('POST', '/auth/forgot-password', { body: { email: process.env.SEED_STUDENT_EMAIL } })
  expect(status === 200 && data.success, `status ${status}`)
})

// ---- Role-based access checks (run only when the demo accounts exist) ----
async function login(email, password) {
  if (!email || !password) return null
  const { status, data } = await call('POST', '/auth/login', { body: { email, password } })
  return status === 200 ? data : null
}

const adminLogin = await login(process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD)
const instructorLogin = await login(process.env.SEED_INSTRUCTOR_EMAIL, process.env.SEED_INSTRUCTOR_PASSWORD)

if (adminLogin) {
  await check('Admin cannot create an admin account (403)', async () => {
    const { status } = await call('POST', '/admin/staff', {
      token: adminLogin.token,
      body: { fullName: 'Smoke Admin', email: 'smoke-admin@example.com', role: 'admin' }
    })
    expect(status === 403, `status ${status}`)
  })
}

if (instructorLogin) {
  await check('Instructor sees only assigned courses', async () => {
    const all = await call('GET', '/courses')
    const mine = await call('GET', '/admin/courses', { token: instructorLogin.token })
    expect(mine.status === 200, `status ${mine.status}`)
    expect(mine.data.total < all.data.total, `instructor sees ${mine.data.total} of ${all.data.total} courses`)
  })
  await check('Instructor cannot create courses or list staff (403)', async () => {
    const a = await call('POST', '/admin/courses', { token: instructorLogin.token, body: { slug: 'x', title: 'x', category: 'x', faculty: 'x', fee: 'x' } })
    const b = await call('GET', '/admin/staff', { token: instructorLogin.token })
    expect(a.status === 403 && b.status === 403, `statuses ${a.status} / ${b.status}`)
  })
}

await check('Super admin can create and remove an instructor (temporary password flow)', async () => {
  const email = `smoke-${Date.now()}@example.com`
  const created = await call('POST', '/admin/staff', {
    token: adminToken,
    body: { fullName: 'Smoke Instructor', email, role: 'instructor' }
  })
  expect(created.status === 201 && created.data.temporaryPassword, `create status ${created.status}`)

  const first = await call('POST', '/auth/login', { body: { email, password: created.data.temporaryPassword } })
  expect(first.status === 200 && first.data.user.mustChangePassword === true, 'mustChangePassword flag missing')

  const blocked = await call('GET', '/admin/dashboard', { token: first.data.token })
  expect(blocked.status === 403 && blocked.data.code === 'PASSWORD_CHANGE_REQUIRED', `blocked status ${blocked.status}`)

  const changed = await call('POST', '/auth/change-password', {
    token: first.data.token,
    body: { currentPassword: created.data.temporaryPassword, newPassword: 'SmokeNewPass2026' }
  })
  expect(changed.status === 200, `change status ${changed.status}`)

  const open = await call('GET', '/admin/dashboard', { token: first.data.token })
  expect(open.status === 200, `dashboard after change ${open.status}`)

  const removed = await call('DELETE', `/admin/staff/${created.data.staff.id}`, { token: adminToken })
  expect(removed.status === 200, `delete status ${removed.status}`)
})

await check('Registration cannot create a staff account', async () => {
  const email = `smoke-reg-${Date.now()}@example.com`
  const { status, data } = await call('POST', '/auth/register', {
    body: { fullName: 'Smoke Register', email, password: 'SmokePass2026', role: 'superadmin' }
  })
  expect(status === 201 && data.user.role === 'student', `role is ${data && data.user && data.user.role}`)
})

const failed = results.filter((r) => !r.ok)
console.log('\nSmoke test results')
console.log('------------------')
for (const r of results) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : `  -> ${r.error}`}`)
}
console.log(`\n${results.length - failed.length} of ${results.length} checks passed.`)
process.exit(failed.length ? 1 : 0)
