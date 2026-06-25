import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, sparse: true },
    name: { type: String, required: true },
    admin: String,
    center: String,
    decision_no: String,
    coordinators: String,
    workDays: [String],
    timeFrom: String,
    timeTo: String,
    phone: String,
    address: String,
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Branch', branchSchema);
