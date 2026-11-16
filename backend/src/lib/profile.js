// Fields a person can have on their profile (used for staff and for "My Profile")

export const PROFILE_SELECT =
  'full_name email phone nic preferred_language role title department qualifications bio photo_url public_profile must_change_password created_at'

// Converts the camelCase body from the website into snake_case database fields.
// Only known fields are copied; role, email and password can never be set here.
export function profileFields(body) {
  const out = {}
  const map = {
    fullName: 'full_name',
    phone: 'phone',
    nic: 'nic',
    preferredLanguage: 'preferred_language',
    title: 'title',
    department: 'department',
    qualifications: 'qualifications',
    bio: 'bio',
    photoUrl: 'photo_url'
  }
  for (const [key, field] of Object.entries(map)) {
    if (body[key] === undefined || body[key] === null) continue
    const value = String(body[key]).trim()
    if (field === 'full_name' && !value) continue
    out[field] = field === 'preferred_language' ? value || 'English' : value
  }
  if (body.publicProfile !== undefined) out.public_profile = Boolean(body.publicProfile)
  return out
}
