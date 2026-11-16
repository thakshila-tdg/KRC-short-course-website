import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    nic: { type: String, default: '' },
    password_hash: { type: String, required: true },
    preferred_language: { type: String, default: 'English' },
    role: { type: String, enum: ['student', 'instructor', 'admin', 'superadmin'], default: 'student' },
    // Staff profile (shown on the public Staff page when public_profile is true)
    title: { type: String, default: '' },
    department: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    bio: { type: String, default: '' },
    photo_url: { type: String, default: '' },
    public_profile: { type: Boolean, default: false },
    // Accounts created by staff start with a temporary password that must be changed
    must_change_password: { type: Boolean, default: false },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    failed_login_attempts: { type: Number, default: 0 },
    lockout_until: { type: Date, default: null },
    reset_token_hash: { type: String, default: null },
    reset_token_expiry: { type: Date, default: null }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

export default mongoose.model('User', userSchema)
