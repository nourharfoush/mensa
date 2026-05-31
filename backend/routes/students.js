import express from 'express';
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

router.get('/', studentController.getStudents);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);
router.post('/bulk-import', studentController.bulkImportStudents);

export default router;
