import mongoose from 'mongoose'

const inquirySchema = new mongoose.Schema(
  {
    ticket_ref: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    course: { type: String, default: '' },
    centre: { type: String, default: '' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'Open' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

export default mongoose.model('Inquiry', inquirySchema)
