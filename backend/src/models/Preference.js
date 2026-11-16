import mongoose from 'mongoose'

const preferenceSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    cookie_essential: { type: Boolean, default: true },
    cookie_functional: { type: Boolean, default: true },
    cookie_analytics: { type: Boolean, default: true }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

export default mongoose.model('Preference', preferenceSchema)
