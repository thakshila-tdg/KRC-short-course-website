import { Router } from 'express'
import Preference from '../models/Preference.js'
import { asyncHandler } from '../lib/asyncHandler.js'

const router = Router()

const DEFAULTS = { essential: true, functional: true, analytics: true }

// 1. GET /api/preferences
router.get('/', asyncHandler(async (req, res) => {
  if (req.user) {
    const prefs = await Preference.findOne({ user_id: req.user.id }).lean()
    if (prefs) {
      return res.json({
        success: true,
        preferences: {
          essential: Boolean(prefs.cookie_essential),
          functional: Boolean(prefs.cookie_functional),
          analytics: Boolean(prefs.cookie_analytics)
        }
      })
    }
  }
  res.json({ success: true, preferences: { ...DEFAULTS } })
}))

// 2. POST /api/preferences
router.post('/', asyncHandler(async (req, res) => {
  const b = req.body || {}
  const preferences = {
    essential: b.essential === undefined ? true : Boolean(b.essential),
    functional: b.functional === undefined ? true : Boolean(b.functional),
    analytics: b.analytics === undefined ? true : Boolean(b.analytics)
  }

  if (req.user) {
    await Preference.findOneAndUpdate(
      { user_id: req.user.id },
      {
        cookie_essential: preferences.essential,
        cookie_functional: preferences.functional,
        cookie_analytics: preferences.analytics
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
  }

  res.json({ success: true, message: 'Preferences saved successfully.', preferences })
}))

export default router
