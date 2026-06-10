import mongoose from 'mongoose';

const shariaCourseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stage: String,
    level: String,
    discipline: String,
    teacher: String,
    hours: Number,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaCourse', shariaCourseSchema);
