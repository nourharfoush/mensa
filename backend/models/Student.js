import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    admin: String,
    center: String,
    branch: String,
    rowaq: String,
    gender: String,
    level: String,
    session_id: mongoose.Schema.Types.ObjectId,
    session_no: String,
    national_id: { type: String, unique: true, sparse: true },
    phone: String,
    email: String,
    address: String,
    guardian_name: String,
    guardian_phone: String,
    isArchived: { type: Boolean, default: false },
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('Student', studentSchema);
