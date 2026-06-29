import express from 'express';
import * as controller from '../controllers/shariaNewsController.js';

const router = express.Router();

router.get('/', controller.getShariaNewsList);
router.post('/', controller.createShariaNews);
router.put('/:id', controller.updateShariaNews);
router.delete('/:id', controller.deleteShariaNews);
router.post('/bulk-import', controller.bulkImportShariaNews);

export default router;
