const express = require('express');
const router = express.Router();
const { 
  getColumns, 
  getColumn, 
  createColumn, 
  updateColumn, 
  deleteColumn,
  reorderColumns 
} = require('../controllers/columnController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Board-specific column routes
router.get('/boards/:boardId/columns', getColumns);
router.post('/boards/:boardId/columns', createColumn);
router.put('/boards/:boardId/columns/reorder', reorderColumns);

// Individual column routes
router.get('/:id', getColumn);
router.put('/:id', updateColumn);
router.delete('/:id', deleteColumn);

module.exports = router; 