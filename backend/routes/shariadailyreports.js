import express from 'express';
import * as controller from '../controllers/shariaDailyReportController.js';

const router = express.Router();

router.get('/', controller.getShariaDailyReports);
router.post('/', controller.createShariaDailyReport);
router.put('/:id', controller.updateShariaDailyReport);
router.delete('/:id', controller.deleteShariaDailyReport);
router.post('/bulk-import', controller.bulkImportShariaDailyReports);

export default router;
