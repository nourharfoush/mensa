import express from 'express';
import * as controller from '../controllers/shariaTeacherController.js';

const router = express.Router();

router.get('/', controller.getShariaTeachers);
router.post('/', controller.createShariaTeacher);
router.put('/:id', controller.updateShariaTeacher);
router.delete('/:id', controller.deleteShariaTeacher);
router.post('/bulk-import', controller.bulkImportShariaTeachers);

export default router;
