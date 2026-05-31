import express from 'express';
import * as managerController from '../controllers/managerController.js';

const router = express.Router();

// Managers routes
router.get('/', managerController.getManagers);
router.get('/:id', managerController.getManager);
router.post('/', managerController.createManager);
router.put('/:id', managerController.updateManager);
router.delete('/:id', managerController.deleteManager);
router.post('/bulk-import', managerController.bulkImportManagers);

export default router;
