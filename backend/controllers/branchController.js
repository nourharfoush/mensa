import Branch from '../models/Branch.js';

export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBranch = async (req, res) => {
  const branch = new Branch(req.body);
  try {
    const newBranch = await branch.save();
    res.status(201).json(newBranch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findOne({ id: req.params.id });
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    Object.assign(branch, req.body);
    const updated = await branch.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findOneAndDelete({ id: req.params.id });
    if (!branch) return res.status(404).json({ message: 'Branch not found' });
    res.json({ message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportBranches = async (req, res) => {
  try {
    const { branches } = req.body;
    const inserted = await Branch.insertMany(branches, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
