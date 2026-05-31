import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, sparse: true },
    session_name: String,
    session_no: String,
    admin: String,
    center: String,
    branch: String,
    quran_type: String,
    level: String,
    start_date: String,
    end_date: String,
    teacher_name: String,
    status: { type: String, default: 'active' },
    branchName: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
