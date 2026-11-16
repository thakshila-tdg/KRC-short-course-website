import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema(
  {
    app_ref: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    course_slug: { type: String, required: true },
    course_title: { type: String, required: true },
    full_name: { type: String, required: true },
    name_with_initials: { type: String, default: '' },
    nic: { type: String, required: true },
    dob: { type: String, default: '' },
    gender: { type: String, default: 'Male' },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    centre: { type: String, required: true },
    qualification: { type: String, default: '' },
    work_exp: { type: String, default: '' },
    payment_method: { type: String, default: 'boc_voucher' },
    voucher_ref: { type: String, default: '' },
    amount: { type: String, default: '' },
    status: { type: String, default: 'Verified' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

export default mongoose.model('Application', applicationSchema)
