import mongoose from 'mongoose';

const mohfezSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    admin: String,
    center: String,
    branch: String,
    contest_date: String,
    rowaq: String,
    national_id: { type: String, unique: true, sparse: true },
    email: String,
    specialization: String,
    status: String,
    phone: String,
    registry_no: String,
  },
  { timestamps: true }
);

export default mongoose.model('Mohfez', mohfezSchema);
