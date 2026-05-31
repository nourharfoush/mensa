import mongoose from 'mongoose';

const managerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    admin: String,
    decision_no: String,
    specialty: String,
    record_no: String,
    national_id: { type: String, unique: true, sparse: true },
    phone: String,
    email: String,
    address: String,
    job_title: String,
    workplace: String,
    job_grade: String,
    qualification: String,
    username: String,
    password: String,
  },
  { timestamps: true }
);

export default mongoose.model('Manager', managerSchema);
