import Manager from '../models/Manager.js';

// Get all managers
export const getManagers = async (req, res) => {
  try {
    const managers = await Manager.find();
    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single manager
export const getManager = async (req, res) => {
  try {
    const manager = await Manager.findOne({ id: req.params.id });
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json(manager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create manager
export const createManager = async (req, res) => {
  const manager = new Manager(req.body);
  try {
    const newManager = await manager.save();
    res.status(201).json(newManager);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update manager
export const updateManager = async (req, res) => {
  try {
    const manager = await Manager.findOne({ id: req.params.id });
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    
    Object.assign(manager, req.body);
    const updated = await manager.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete manager
export const deleteManager = async (req, res) => {
  try {
    const manager = await Manager.findOneAndDelete({ id: req.params.id });
    if (!manager) return res.status(404).json({ message: 'Manager not found' });
    res.json({ message: 'Manager deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk import managers
export const bulkImportManagers = async (req, res) => {
  try {
    const { managers } = req.body;
    const inserted = await Manager.insertMany(managers, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    // Even if some fail, return what was inserted
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
