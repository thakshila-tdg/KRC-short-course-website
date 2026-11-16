import crypto from 'crypto'

// Safe string: trims strings, returns '' for anything else
export const str = (v) => (typeof v === 'string' ? v.trim() : '')

// Random 6-digit number for references such as OUSL-APP-2026-123456
export const randomDigits = (min = 100000, max = 1000000) => crypto.randomInt(min, max)

// Escape user text before using it inside a RegExp
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Accepts an array or a newline separated string and returns an array
export function toList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value.split('\n').map((s) => s.trim()).filter(Boolean)
  }
  return []
}
