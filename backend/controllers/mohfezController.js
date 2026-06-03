import Mohfez from '../models/Mohfez.js';

export const getMohfezs = async (req, res) => {
  try {
    const mohfezs = await Mohfez.find();
    res.json(mohfezs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMohfez = async (req, res) => {
  try {
    const { national_id } = req.body;
    if (national_id) {
      const existing = await Mohfez.findOne({ national_id });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لمحفظ آخر' });
      }
    }
    const mohfez = new Mohfez(req.body);
    const newMohfez = await mohfez.save();
    res.status(201).json(newMohfez);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateMohfez = async (req, res) => {
  try {
    const { national_id } = req.body;
    if (national_id) {
      const existing = await Mohfez.findOne({ national_id, id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لمحفظ آخر' });
      }
    }
    const mohfez = await Mohfez.findOne({ id: req.params.id });
    if (!mohfez) return res.status(404).json({ message: 'Mohfez not found' });
    Object.assign(mohfez, req.body);
    const updated = await mohfez.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteMohfez = async (req, res) => {
  try {
    const mohfez = await Mohfez.findOneAndDelete({ id: req.params.id });
    if (!mohfez) return res.status(404).json({ message: 'Mohfez not found' });
    res.json({ message: 'Mohfez deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportMohfezs = async (req, res) => {
  try {
    const { mohfezs } = req.body;
    const inserted = await Mohfez.insertMany(mohfezs, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
