import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import { config } from '../config/env.js'
import { requireAuth } from '../middleware/auth.js'
import { loginRateLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { str } from '../lib/text.js'
import { permissionsFor, isStaffRole } from '../config/permissions.js'

const router = Router()

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex')

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.isProd,
    sameSite: config.isProd ? 'none' : 'lax'
  }
}

function setAuthCookie(res, token) {
  res.cookie('token', token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 })
}

function signToken(user) {
  return jwt.sign(
    { id: String(user._id), email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  )
}

function publicUser(u) {
  return {
    id: String(u._id),
    name: u.full_name,
    email: u.email,
    phone: u.phone,
    nic: u.nic,
    preferredLanguage: u.preferred_language,
    role: u.role,
    title: u.title || '',
    permissions: permissionsFor(u.role),
    mustChangePassword: Boolean(u.must_change_password)
  }
}

// 1. POST /api/auth/register
router.post('/register', asyncHandler(async (req, res) => {
  const body = req.body || {}
  const fullName = str(body.fullName)
  const email = str(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''

  if (!fullName || !email || !password) {
    return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' })
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' })
  }
  if (password.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be at most 128 characters long.' })
  }

  if (await User.exists({ email })) {
    return res.status(409).json({ success: false, message: 'An account with this email address already exists.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  let user
  try {
    user = await User.create({
      full_name: fullName,
      email,
      phone: str(body.phone),
      nic: str(body.nic),
      password_hash: passwordHash,
      preferred_language: str(body.preferredLanguage) || 'English',
      role: 'student'
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' })
    }
    throw err
  }

  const token = signToken(user)
  setAuthCookie(res, token)

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    token,
    user: publicUser(user)
  })
}))

// 2. POST /api/auth/login
router.post('/login', loginRateLimiter, asyncHandler(async (req, res) => {
  const body = req.body || {}
  const email = str(body.email).toLowerCase()
  const password = typeof body.password === 'string' ? body.password : ''
  const expectedRole = str(body.expectedRole)

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' })
  }

  // Lockout check
  if (user.lockout_until) {
    const lockoutTime = user.lockout_until.getTime()
    if (Date.now() < lockoutTime) {
      const remainingMinutes = Math.ceil((lockoutTime - Date.now()) / (60 * 1000))
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to repeated failed logins. Please try again in ${remainingMinutes} minute(s).`
      })
    }
    user.failed_login_attempts = 0
    user.lockout_until = null
  }

  const isValid = await bcrypt.compare(password, user.password_hash)
  if (!isValid) {
    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1
    if (user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockout_until = new Date(Date.now() + LOCKOUT_MS)
      await user.save()
      return res.status(429).json({
        success: false,
        message: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.'
      })
    }
    await user.save()
    return res.status(401).json({
      success: false,
      message: `Invalid email or password. Attempt ${user.failed_login_attempts} of ${MAX_LOGIN_ATTEMPTS} before temporary lockout.`
    })
  }

  // Portal check: the staff login ("admin" or "staff") accepts instructor, admin and
  // superadmin accounts; the student login accepts students only. The role itself always
  // comes from the database, never from the request.
  if (expectedRole) {
    const wantsStaff = expectedRole === 'admin' || expectedRole === 'staff'
    if (wantsStaff && !isStaffRole(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This account is a Student account. Please use the Student login.'
      })
    }
    if (expectedRole === 'student' && isStaffRole(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This account is a Lecturer/Admin account. Please use the Lecturer login.'
      })
    }
  }

  user.failed_login_attempts = 0
  user.lockout_until = null
  await user.save()

  const token = signToken(user)
  setAuthCookie(res, token)

  res.json({
    success: true,
    message: 'Sign in successful.',
    token,
    user: publicUser(user)
  })
}))

// 3. POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions())
  res.json({ success: true, message: 'Signed out successfully.' })
})

// 4. GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const u = req.user
  res.json({
    success: true,
    user: {
      id: u.id,
      name: u.full_name,
      email: u.email,
      phone: u.phone,
      nic: u.nic,
      preferredLanguage: u.preferred_language,
      role: u.role,
      title: u.title || '',
      permissions: permissionsFor(u.role),
      mustChangePassword: Boolean(u.must_change_password),
      createdAt: u.created_at
    }
  })
})

// 5. POST /api/auth/forgot-password
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const email = str((req.body || {}).email).toLowerCase()
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' })
  }

  // A token is always generated so the response looks the same whether or not the account exists.
  const token = crypto.randomBytes(32).toString('hex')
  const user = await User.findOne({ email })

  if (user) {
    user.reset_token_hash = sha256(token) // only the hash is stored
    user.reset_token_expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()
    if (!config.isProd) {
      console.log(`[Password reset] Token for ${email}: ${token}`)
    }
  }

  const response = {
    success: true,
    message: 'If an account exists with this email, password reset instructions have been generated.'
  }
  // Demo convenience only (see DEV_RESET_TOKEN_IN_RESPONSE in .env). Never enabled in production.
  if (config.allowResetTokenInResponse) response.resetToken = token

  res.json(response)
}))

// 6. POST /api/auth/reset-password
router.post('/reset-password', asyncHandler(async (req, res) => {
  const token = str((req.body || {}).token)
  const newPassword = typeof (req.body || {}).newPassword === 'string' ? req.body.newPassword : ''

  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required.' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' })
  }
  if (newPassword.length > 128) {
    return res.status(400).json({ success: false, message: 'Password must be at most 128 characters long.' })
  }

  const user = await User.findOne({ reset_token_hash: sha256(token) })
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' })
  }
  if (!user.reset_token_expiry || user.reset_token_expiry.getTime() < Date.now()) {
    return res.status(400).json({ success: false, message: 'Password reset token has expired.' })
  }

  user.password_hash = await bcrypt.hash(newPassword, 12)
  user.reset_token_hash = null
  user.reset_token_expiry = null
  user.must_change_password = false
  user.failed_login_attempts = 0
  user.lockout_until = null
  await user.save()

  res.json({
    success: true,
    message: 'Password has been reset successfully. You may now sign in with your new password.'
  })
}))

// 7. POST /api/auth/change-password (any signed-in user; clears the temporary-password flag)
router.post('/change-password', requireAuth, asyncHandler(async (req, res) => {
  const b = req.body || {}
  const currentPassword = typeof b.currentPassword === 'string' ? b.currentPassword : ''
  const newPassword = typeof b.newPassword === 'string' ? b.newPassword : ''

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required.' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' })
  }
  if (newPassword.length > 128) {
    return res.status(400).json({ success: false, message: 'New password must be at most 128 characters long.' })
  }
  if (newPassword === currentPassword) {
    return res.status(400).json({ success: false, message: 'New password must be different from the current password.' })
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
