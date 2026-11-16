import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ref: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    amount: { type: String, required: true },
    method: { type: String, required: true },
    status: { type: String, default: 'Verified' }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

export default mongoose.model('Payment', paymentSchema)
