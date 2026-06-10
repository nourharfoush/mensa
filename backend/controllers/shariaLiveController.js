import ShariaLive from '../models/ShariaLive.js';

export const getShariaLives = async (req, res) => {
  try {
    const items = await ShariaLive.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShariaLive = async (req, res) => {
  try {
    const item = await ShariaLive.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Live stream not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShariaLive = async (req, res) => {
  const item = new ShariaLive(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShariaLive = async (req, res) => {
  try {
    const item = await ShariaLive.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Live stream not found' });
    
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShariaLive = async (req, res) => {
  try {
    const item = await ShariaLive.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Live stream not found' });
    res.json({ message: 'Live stream deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportShariaLives = async (req, res) => {
  try {
    const { items } = req.body;
    const inserted = await ShariaLive.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
