import express from 'express';
import { getItems, getItem, createItem, updateItem, deleteItem, bulkImportItems } from '../controllers/platformMohfezController.js';

const router = express.Router();

router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.post('/bulk-import', bulkImportItems);

export default router;
