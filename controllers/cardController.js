const Card = require('../models/Card');
const Column = require('../models/Column');

exports.createCard = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, description, priority, status, dueDate, assignees } = req.body;
    
    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    
    const card = new Card({
      title,
      description,
      priority,
      status,
      dueDate,
      assignees,
      column: columnId,
      board: column.board
    });
    
    await card.save();
    
    // Add card to column
    column.cards.push(card._id);
    await column.save();
    
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.moveCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { newColumnId, newPosition } = req.body;
    
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }
    
    // Remove from old column
    await Column.findByIdAndUpdate(
      card.column,
      { $pull: { cards: cardId } }
    );
    
    // Add to new column at specific position
    const newColumn = await Column.findById(newColumnId);
    newColumn.cards.splice(newPosition, 0, cardId);
    await newColumn.save();
    
    // Update card's column reference
    card.column = newColumnId;
    await card.save();
    
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};