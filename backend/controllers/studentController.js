import Student from '../models/Student.js';

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createStudent = async (req, res) => {
  try {
    const { national_id } = req.body;
    if (national_id) {
      const existing = await Student.findOne({ national_id });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لطالب آخر' });
      }
    }
    const student = new Student(req.body);
    const newStudent = await student.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { national_id } = req.body;
    if (national_id) {
      // Find duplicate with same national_id but different custom id
      const existing = await Student.findOne({ national_id, id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لطالب آخر' });
      }
    }
    const student = await Student.findOne({ id: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    Object.assign(student, req.body);
    const updated = await student.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ id: req.params.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    const inserted = await Student.insertMany(students, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
