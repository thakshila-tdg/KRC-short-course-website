import mongoose from 'mongoose'

const gradeSchema = new mongoose.Schema(
  {
    student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    enrollment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', default: null },
    assignment: { type: String, required: true },
    marks: { type: Number, default: 0 },
    max_marks: { type: Number, default: 100 },
    grade: { type: String, default: '' },
    remarks: { type: String, default: '' },
    graded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: false } }
)

export default mongoose.model('Grade', gradeSchema)
