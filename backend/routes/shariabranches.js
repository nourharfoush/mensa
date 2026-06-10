import express from 'express';
import * as controller from '../controllers/shariaBranchController.js';

const router = express.Router();

router.get('/', controller.getShariaBranches);
router.post('/', controller.createShariaBranch);
router.put('/:id', controller.updateShariaBranch);
router.delete('/:id', controller.deleteShariaBranch);
router.post('/bulk-import', controller.bulkImportShariaBranches);

export default router;
