import mongoose from 'mongoose';
import ShariaDailyReport from '../models/ShariaDailyReport.js';

export const getShariaDailyReports = async (req, res) => {
  try {
    const items = await ShariaDailyReport.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShariaDailyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaDailyReport.findOne(query);
    if (!item) return res.status(404).json({ message: 'Daily report not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShariaDailyReport = async (req, res) => {
  const item = new ShariaDailyReport(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShariaDailyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaDailyReport.findOne(query);
    if (!item) return res.status(404).json({ message: 'Daily report not found' });
    
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShariaDailyReport = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaDailyReport.findOneAndDelete(query);
    if (!item) return res.status(404).json({ message: 'Daily report not found' });
    res.json({ message: 'Daily report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportShariaDailyReports = async (req, res) => {
  try {
    const { items } = req.body;
    const inserted = await ShariaDailyReport.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
