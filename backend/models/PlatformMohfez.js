import mongoose from 'mongoose';

const platformMohfezSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('PlatformMohfez', platformMohfezSchema);
