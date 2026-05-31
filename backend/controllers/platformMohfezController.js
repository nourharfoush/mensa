import PlatformMohfez from '../models/PlatformMohfez.js';

export const getItems = async (req, res) => {
  try {
    const items = await PlatformMohfez.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getItem = async (req, res) => {
  try {
    const item = await PlatformMohfez.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createItem = async (req, res) => {
  const item = new PlatformMohfez(req.body);
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await PlatformMohfez.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    Object.assign(item, req.body);
    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await PlatformMohfez.findOneAndDelete({ id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportItems = async (req, res) => {
  try {
    const items = req.body.items || req.body.platformmohfezs || [];
    const inserted = await PlatformMohfez.insertMany(items, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
