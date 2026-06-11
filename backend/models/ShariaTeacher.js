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
    jobGrade: String,
    university: String,
    college: String,
    department: String,
    governorate: String,
    branches: [String],
    branch: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaTeacher', shariaTeacherSchema);
