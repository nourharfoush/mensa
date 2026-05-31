import mongoose from 'mongoose';

const platformApplicantSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('PlatformApplicant', platformApplicantSchema);
