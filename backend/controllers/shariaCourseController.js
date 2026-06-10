import mongoose from 'mongoose';
import ShariaCourse from '../models/ShariaCourse.js';

export const getShariaCourses = async (req, res) => {
  try {
    const items = await ShariaCourse.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShariaCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaCourse.findOne(query);
    if (!item) return res.status(404).json({ message: 'Course not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShariaCourse = async (req, res) => {
  const item = new ShariaCourse(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShariaCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaCourse.findOne(query);
    if (!item) return res.status(404).json({ message: 'Course not found' });
    
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShariaCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaCourse.findOneAndDelete(query);
    if (!item) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportShariaCourses = async (req, res) => {
  try {
    const { items } = req.body;
    const inserted = await ShariaCourse.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
