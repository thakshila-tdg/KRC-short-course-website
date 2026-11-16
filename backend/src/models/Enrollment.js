import mongoose from 'mongoose'

const enrollmentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    course_code: { type: String, required: true },
    course_slug: { type: String, default: '' },
    title: { type: String, required: true },
    faculty: { type: String, default: '' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    next_session: { type: String, default: '' },
    coordinator: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    modules: { type: [String], default: [] }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

export default mongoose.model('Enrollment', enrollmentSchema)
