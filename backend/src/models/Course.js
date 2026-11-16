import mongoose from 'mongoose'

const { Mixed } = mongoose.Schema.Types

const courseSchema = new mongoose.Schema(
  {
    order: { type: Number, default: 0, index: true },
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    faculty: { type: String, required: true, trim: true },
    department: { type: String, default: '' },
    fee: { type: String, required: true },
    fee_num: { type: Number, default: 0 },
    duration: { type: String, default: '' },
    mode: { type: String, default: 'Blended' },
    language: { type: String, default: 'English' },
    intake: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    image: { type: String, default: '' },
    fallback_image: { type: String, default: '' },
    source_url: { type: String, default: '' },
    short_description: { type: String, default: '' },
    overview: { type: String, default: '' },
    objectives: { type: [Mixed], default: [] },
    curriculum: { type: [Mixed], default: [] },
    eligibility: { type: [Mixed], default: [] },
    career_paths: { type: [Mixed], default: [] },
    coordinator: { type: Mixed, default: '' },
    payment_account: { type: Mixed, default: '' },
    // Instructors (User ids with role instructor) who teach this course
    instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

export default mongoose.model('Course', courseSchema)
