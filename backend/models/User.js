import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, sparse: true },
    password: String,
    national_id: String,
    record_number: String,
    phone: String,
    role: { type: String, default: 'student' },
    userAdmin: String,
    userCenter: String,
    userBranch: String,
    userSession: String,
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
