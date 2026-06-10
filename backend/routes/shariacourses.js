import express from 'express';
import * as controller from '../controllers/shariaCourseController.js';

const router = express.Router();

router.get('/', controller.getShariaCourses);
router.post('/', controller.createShariaCourse);
router.put('/:id', controller.updateShariaCourse);
router.delete('/:id', controller.deleteShariaCourse);
router.post('/bulk-import', controller.bulkImportShariaCourses);

export default router;
