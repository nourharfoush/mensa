import mongoose from 'mongoose';

const platformStudentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('PlatformStudent', platformStudentSchema);
