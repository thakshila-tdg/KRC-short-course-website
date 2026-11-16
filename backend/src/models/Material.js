import mongoose from 'mongoose'

const materialSchema = new mongoose.Schema(
  {
    course_title: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, default: 'N/A' },
    file_path: { type: String, default: '' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

export default mongoose.model('Material', materialSchema)
