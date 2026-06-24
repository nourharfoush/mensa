import mongoose from 'mongoose';

const shariaDailyReportSchema = new mongoose.Schema(
  {
    governorate: { type: String, required: true },
    stage: { type: String, required: true },
    level: { type: String, required: true },
    subject: { type: String, required: true }, // Course / Subject name
    date: { type: String, required: true }, // YYYY-MM-DD
    teacher: { type: String, required: true }, // Lecturer name
    lectureNumber: { type: Number, required: true },
    lectureTitle: String,
    
    // Question 1: Essay (مقالي)
    question1: { type: String, required: true },
    
    // Question 2: True/False (صح وخطأ)
    question2: { type: String, required: true },
    question2Answer: { type: String, required: true }, // "صح" or "خطأ"
    
    // Question 3: Multiple Choice (اختيار من متعدد)
    question3: { type: String, required: true },
    question3Options: { type: [String], required: true }, // Array of options
    question3Answer: { type: String, required: true }, // Correct choice option
    
    // Reporter metadata
    reporter: String,
    reporterRole: String
  },
  { strict: false, timestamps: true }
);

export default mongoose.model('ShariaDailyReport', shariaDailyReportSchema);
