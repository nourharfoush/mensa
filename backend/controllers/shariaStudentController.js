import mongoose from 'mongoose';
import ShariaStudent from '../models/ShariaStudent.js';

export const getShariaStudents = async (req, res) => {
  try {
    const items = await ShariaStudent.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShariaStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaStudent.findOne(query);
    if (!item) return res.status(404).json({ message: 'Student not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShariaStudent = async (req, res) => {
  try {
    const { nationalId } = req.body;
    if (nationalId) {
      const existing = await ShariaStudent.findOne({ nationalId });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لطالب آخر' });
      }
    }
    const item = new ShariaStudent(req.body);
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShariaStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { nationalId } = req.body;
    
    if (nationalId) {
      const queryDuplicate = mongoose.Types.ObjectId.isValid(id)
        ? { nationalId, $and: [{ id: { $ne: id } }, { _id: { $ne: id } }] }
        : { nationalId, id: { $ne: id } };
      const existing = await ShariaStudent.findOne(queryDuplicate);
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لطالب آخر' });
      }
    }
    
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaStudent.findOne(query);
    if (!item) return res.status(404).json({ message: 'Student not found' });
    
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShariaStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaStudent.findOneAndDelete(query);
    if (!item) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportShariaStudents = async (req, res) => {
  try {
    const { items } = req.body;
    const inserted = await ShariaStudent.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
