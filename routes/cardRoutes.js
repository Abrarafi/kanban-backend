const express = require('express');
const router = express.Router();
const { 
  createCard, 
  moveCard, 
  getBoardCards, 
  getColumnCards, 
  getCard,
  updateCard,
  deleteCard 
} = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Create and move cards
router.post('/:columnId', createCard);
router.patch('/:cardId/move', moveCard);

// Get cards
router.get('/boards/:boardId/cards', getBoardCards);
router.get('/columns/:columnId/cards', getColumnCards);
router.get('/:id', getCard);

// Update and delete cards
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;