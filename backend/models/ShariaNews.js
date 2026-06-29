import mongoose from 'mongoose';

const shariaNewsSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    content: String,
    date: String,
    category: String,
    status: String,
    attachments: Array,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaNews', shariaNewsSchema);
