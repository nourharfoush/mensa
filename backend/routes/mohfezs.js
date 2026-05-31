import express from 'express';
import * as mohfezController from '../controllers/mohfezController.js';

const router = express.Router();

router.get('/', mohfezController.getMohfezs);
router.post('/', mohfezController.createMohfez);
router.put('/:id', mohfezController.updateMohfez);
router.delete('/:id', mohfezController.deleteMohfez);
router.post('/bulk-import', mohfezController.bulkImportMohfezs);

export default router;
