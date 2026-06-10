import mongoose from 'mongoose';

const shariaTeacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    nationalId: { type: String, unique: true, sparse: true },
    qualification: String,
    specialization: String,
    administration: String,
    status: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaTeacher', shariaTeacherSchema);
