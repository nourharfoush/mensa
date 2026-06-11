import mongoose from 'mongoose';

const shariaStudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    nationalId: { type: String, unique: true, sparse: true },
    governorate: String,
    branch: String,
    stage: String,
    level: String,
    discipline: String,
    fiqhSchool: String,
    gender: String,
    studyType: String,
    code: String,
    seatNumber: String,
    phone: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaStudent', shariaStudentSchema);
