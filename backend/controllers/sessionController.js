import Session from '../models/Session.js';

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSession = async (req, res) => {
  const session = new Session(req.body);
  try {
    const newSession = await session.save();
    res.status(201).json(newSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSession = async (req, res) => {
  try {
    const session = await Session.findOne({ id: req.params.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    Object.assign(session, req.body);
    const updated = await session.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ id: req.params.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkImportSessions = async (req, res) => {
  try {
    const { sessions } = req.body;
    const inserted = await Session.insertMany(sessions, { ordered: false });
    res.status(201).json(inserted);
  } catch (error) {
    if (error.insertedDocs) {
      res.status(201).json(error.insertedDocs);
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};
