import mongoose from 'mongoose';

const coordinatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    admin: String,
    center: String,
    branch: String,
    decision_no: String,
    specialization: String,
    registry_no: String,
    national_id: { type: String, unique: true, sparse: true },
    phone: String,
    email: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('Coordinator', coordinatorSchema);
