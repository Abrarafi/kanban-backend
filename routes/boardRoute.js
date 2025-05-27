const express = require('express');
const router = express.Router();
const { createBoard, getBoard } = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createBoard);
router.get('/:id', getBoard);

module.exports = router;