import ShariaBranch from '../models/ShariaBranch.js';

export const getShariaBranches = async (req, res) => {
  try {
    const items = await ShariaBranch.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getShariaBranch = async (req, res) => {
  try {
    const item = await ShariaBranch.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Branch not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createShariaBranch = async (req, res) => {
  const item = new ShariaBranch(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateShariaBranch = async (req, res) => {
  try {
    const item = await ShariaBranch.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Branch not found' });
    
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteShariaBranch = async (req, res) => {
  try {
    const item = await ShariaBranch.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportShariaBranches = async (req, res) => {
  try {
    const { items } = req.body;
    const inserted = await ShariaBranch.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
