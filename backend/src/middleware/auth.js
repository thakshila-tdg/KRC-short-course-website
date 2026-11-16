import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/User.js'
import { config } from '../config/env.js'
import { hasPermission, isStaffRole } from '../config/permissions.js'

// Reads the login token (Authorization header or httpOnly cookie) and
// attaches the user to req.user. Never blocks the request by itself.
// The role is read from the database on every request, so a demotion or
// removal takes effect immediately.
export async function authenticate(req, res, next) {
  req.user = null
  try {
    const candidates = []
    const header = req.headers.authorization
    if (header && header.startsWith('Bearer ')) candidates.push(header.slice(7))
    if (req.cookies && req.cookies.token) candidates.push(req.cookies.token)

    let decoded = null
    for (const token of candidates) {
      try {
        decoded = jwt.verify(token, config.jwtSecret)
        break
      } catch {
        // try the next candidate (for example the cookie)
      }
    }
    if (!decoded || !mongoose.isObjectIdOrHexString(decoded.id)) return next()

    const user = await User.findById(decoded.id)
      .select('-password_hash -reset_token_hash -reset_token_expiry')
      .lean()
    if (user) req.user = { ...user, id: String(user._id) }
    next()
  } catch (err) {
    next(err)
  }
}

// Staff created by an admin must replace their temporary password before using
// the admin or student areas. The change-password endpoint stays available.
export function enforcePasswordChange(req, res, next) {
  const guarded = req.path.startsWith('/api/admin') || req.path.startsWith('/api/student')
  if (guarded && req.user && req.user.must_change_password) {
    return res.status(403).json({
      success: false,
      code: 'PASSWORD_CHANGE_REQUIRED',
      message: 'You must change your temporary password before continuing.'
    })
  }
  next()
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' })
  }
  next()
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' })
    }
    if (req.user.role !== role) {
      return res.status(403).json({ success: false, message: `Forbidden: requires ${role} privileges.` })
    }
    next()
  }
}

// Any staff role: instructor, admin or superadmin
export function requireStaff(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' })
  }
  if (!isStaffRole(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: staff access only.' })
  }
  next()
}

// Checks one named permission from config/permissions.js
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please sign in.' })
    }
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: your role does not have permission to do this.',
        required: permission
      })
    }
    next()
  }
}
