import mongoose from 'mongoose';

const platformMohfezSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: String,
    phone: String,
    national_id: { type: String, unique: true, sparse: true },
    registry_no: String,
    job: String,
    workplace: String,
    job_grade: String,
    qualification: String,
    contest_date: String,
    status: String,
    address: String,
    rowaq: String,
    username: String,
    password: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('PlatformMohfez', platformMohfezSchema);
