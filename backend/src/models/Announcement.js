import mongoose from 'mongoose'

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    audience: { type: String, default: 'all' },
    course_slug: { type: String, default: null },
    author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    author_name: { type: String, default: '' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

export default mongoose.model('Announcement', announcementSchema)
