import express from 'express';
import * as branchController from '../controllers/branchController.js';

const router = express.Router();

router.get('/', branchController.getBranches);
router.post('/', branchController.createBranch);
router.put('/:id', branchController.updateBranch);
router.delete('/:id', branchController.deleteBranch);
router.post('/bulk-import', branchController.bulkImportBranches);

export default router;
