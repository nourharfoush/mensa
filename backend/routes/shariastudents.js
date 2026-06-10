import express from 'express';
import * as controller from '../controllers/shariaStudentController.js';

const router = express.Router();

router.get('/', controller.getShariaStudents);
router.post('/', controller.createShariaStudent);
router.put('/:id', controller.updateShariaStudent);
router.delete('/:id', controller.deleteShariaStudent);
router.post('/bulk-import', controller.bulkImportShariaStudents);

export default router;
