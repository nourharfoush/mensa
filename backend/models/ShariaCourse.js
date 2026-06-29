import mongoose from 'mongoose';

const shariaCourseSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    stage: String,
    level: String,
    discipline: String,
    teacher: String,
    hours: Number,
    pdfs: [
      {
        name: String,
        data: String // Base64 Data URL
      }
    ]
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaCourse', shariaCourseSchema);
