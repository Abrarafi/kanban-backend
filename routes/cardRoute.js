const express = require('express');
const router = express.Router();
const { createCard, moveCard } = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/:columnId', createCard);
router.patch('/:cardId/move', moveCard);

module.exports = router;