import express from 'express';
import * as coordinatorController from '../controllers/coordinatorController.js';

const router = express.Router();

router.get('/', coordinatorController.getCoordinators);
router.post('/', coordinatorController.createCoordinator);
router.put('/:id', coordinatorController.updateCoordinator);
router.delete('/:id', coordinatorController.deleteCoordinator);
router.post('/bulk-import', coordinatorController.bulkImportCoordinators);

export default router;
