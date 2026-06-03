import Coordinator from '../models/Coordinator.js';

export const getCoordinators = async (req, res) => {
  try {
    const coordinators = await Coordinator.find();
    res.json(coordinators);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCoordinator = async (req, res) => {
  try {
    const { national_id } = req.body;
    if (national_id) {
      const existing = await Coordinator.findOne({ national_id });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لمنسق آخر' });
      }
    }
    const coordinator = new Coordinator(req.body);
    const newCoordinator = await coordinator.save();
    res.status(201).json(newCoordinator);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateCoordinator = async (req, res) => {
  try {
    const { national_id } = req.body;
    if (national_id) {
      const existing = await Coordinator.findOne({ national_id, id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'الرقم القومي مسجل بالفعل لمنسق آخر' });
      }
    }
    const coordinator = await Coordinator.findOne({ id: req.params.id });
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found' });
    Object.assign(coordinator, req.body);
    const updated = await coordinator.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteCoordinator = async (req, res) => {
  try {
    const coordinator = await Coordinator.findOneAndDelete({ id: req.params.id });
    if (!coordinator) return res.status(404).json({ message: 'Coordinator not found' });
    res.json({ message: 'Coordinator deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportCoordinators = async (req, res) => {
  try {
    const { coordinators } = req.body;
    const inserted = await Coordinator.insertMany(coordinators, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
