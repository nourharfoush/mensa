import mongoose from 'mongoose';

const shariaLiveSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    title: { type: String, required: true },
    governorate: String,
    stage: String,
    level: String,
    discipline: String,
    teacher: String,
    day: String,
    timeStart: String,
    timeEnd: String,
    link: String,
    isWeekly: Boolean,
    status: String,
    streamType: String,
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaLive', shariaLiveSchema);
