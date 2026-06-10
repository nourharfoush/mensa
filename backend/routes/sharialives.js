import express from 'express';
import * as controller from '../controllers/shariaLiveController.js';

const router = express.Router();

router.get('/', controller.getShariaLives);
router.post('/', controller.createShariaLive);
router.put('/:id', controller.updateShariaLive);
router.delete('/:id', controller.deleteShariaLive);
router.post('/bulk-import', controller.bulkImportShariaLives);

export default router;
