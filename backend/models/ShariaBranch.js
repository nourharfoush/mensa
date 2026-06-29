import mongoose from 'mongoose';

const shariaBranchSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    governorate: String,
    code: String,
    address: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaBranch', shariaBranchSchema);
