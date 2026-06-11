import mongoose from 'mongoose';
import ShariaTeacher from '../models/ShariaTeacher.js';

export const getShariaTeachers = async (req, res) => {
  try {
    const items = await ShariaTeacher.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShariaTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaTeacher.findOne(query);
    if (!item) return res.status(404).json({ message: 'Teacher not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShariaTeacher = async (req, res) => {
  try {
    const { nationalId } = req.body;
    if (nationalId) {
      const existing = await ShariaTeacher.findOne({ nationalId });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لمحاضر آخر' });
      }
    }
    const item = new ShariaTeacher(req.body);
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShariaTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { nationalId } = req.body;
    
    if (nationalId) {
      const queryDuplicate = mongoose.Types.ObjectId.isValid(id)
        ? { nationalId, $and: [{ id: { $ne: id } }, { _id: { $ne: new mongoose.Types.ObjectId(id) } }] }
        : { nationalId, id: { $ne: id } };
      const existing = await ShariaTeacher.findOne(queryDuplicate);
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لمحاضر آخر' });
      }
    }
    
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaTeacher.findOne(query);
    if (!item) return res.status(404).json({ message: 'Teacher not found' });
    
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShariaTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaTeacher.findOneAndDelete(query);
    if (!item) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportShariaTeachers = async (req, res) => {
  try {
    const { items } = req.body;
    const inserted = await ShariaTeacher.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
