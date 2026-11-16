import crypto from 'crypto'

// Characters that are easy to read aloud (no 0/O, 1/l/I)
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghijkmnopqrstuvwxyz'
const DIGITS = '23456789'

const pick = (chars) => chars[crypto.randomInt(chars.length)]

// Random temporary password with at least one upper-case, lower-case and digit
export function generateTempPassword(length = 12) {
  const all = UPPER + LOWER + DIGITS
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS)]
  while (chars.length < length) chars.push(pick(all))
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
