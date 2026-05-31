import mongoose from 'mongoose';

const platformCoordinatorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true }
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('PlatformCoordinator', platformCoordinatorSchema);
