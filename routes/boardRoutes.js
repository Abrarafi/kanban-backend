const express = require('express');
const router = express.Router();
const { createBoard, getBoard, getBoards, updateBoard, deleteBoard } = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

module.exports = router;