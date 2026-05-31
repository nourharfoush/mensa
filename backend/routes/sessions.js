import express from 'express';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();

router.get('/', sessionController.getSessions);
router.post('/', sessionController.createSession);
router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);
router.post('/bulk-import', sessionController.bulkImportSessions);

export default router;
