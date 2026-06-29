import mongoose from 'mongoose';
import ShariaNews from '../models/ShariaNews.js';

export const getShariaNewsList = async (req, res) => {
  try {
    const items = await ShariaNews.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShariaNews = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaNews.findOne(query);
    if (!item) return res.status(404).json({ message: 'News not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShariaNews = async (req, res) => {
  const item = new ShariaNews(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShariaNews = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaNews.findOne(query);
    if (!item) return res.status(404).json({ message: 'News not found' });
    
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShariaNews = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id };
    const item = await ShariaNews.findOneAndDelete(query);
    if (!item) return res.status(404).json({ message: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportShariaNews = async (req, res) => {
  try {
    const { items } = req.body;
    const inserted = await ShariaNews.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
