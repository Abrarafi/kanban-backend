const Card = require('../models/Card');
const Column = require('../models/Column');
const Board = require('../models/Board');

exports.createCard = async (req, res) => {
  try {
    const { columnId } = req.params;
    const { title, description, priority, status, dueDate, assignees } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate priority if provided
    if (priority && !['LOW', 'MEDIUM', 'HIGH', null].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    // Validate status if provided
    if (status && !['Not Started', 'In Research', 'On Track', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Validate dueDate if provided
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ error: 'Invalid due date' });
    }
    
    const column = await Column.findById(columnId);
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(column.board);
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to create cards in this board' });
    }
    
    const card = new Card({
      title,
      description: description || '',
      priority: priority || null,
      status: status || 'Not Started',
      dueDate: dueDate || null,
      assignees: assignees || [],
      column: columnId,
      board: column.board
    });
    
    await card.save();
    
    // Add card to column
    column.cards.push(card._id);
    await column.save();
    
    // Populate the card before sending response
    const populatedCard = await Card.findById(card._id)
      .populate('assignees', 'id name email avatar')
      .populate('column', 'id name')
      .populate('board', 'id name');
    
    res.status(201).json(populatedCard);
  } catch (err) {
    console.error('Card creation error:', err);
    res.status(400).json({ 
      error: 'Failed to create card',
      details: err.message 
    });
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

// Get all cards for a board
exports.getBoardCards = async (req, res) => {
  try {
    const boardId = req.params.boardId;

    // Check if board exists and user has access
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to view cards in this board' });
    }

    const cards = await Card.find({ board: boardId })
      .populate('assignees', 'id name email avatar')
      .populate('column', 'id name')
      .sort({ createdAt: -1 });

    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all cards for a column
exports.getColumnCards = async (req, res) => {
  try {
    const columnId = req.params.columnId;

    // Check if column exists and user has access
    const column = await Column.findById(columnId)
      .populate('board');
    
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }

    if (!column.board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to view cards in this column' });
    }

    const cards = await Card.find({ column: columnId })
      .populate('assignees', 'id name email avatar')
      .sort({ createdAt: -1 });

    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get a single card by ID
exports.getCard = async (req, res) => {
  try {
    const cardId = req.params.id;

    const card = await Card.findById(cardId)
      .populate('assignees', 'id name email avatar')
      .populate('column', 'id name')
      .populate('board', 'id name');

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to view this card' });
    }

    res.json(card);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, dueDate, assignees } = req.body;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to update this card' });
    }

    // Validate priority if provided
    if (priority && !['LOW', 'MEDIUM', 'HIGH', null].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    // Validate status if provided
    if (status && !['Not Started', 'In Research', 'On Track', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Validate dueDate if provided
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ error: 'Invalid due date' });
    }

    // Update fields if provided
    if (title) card.title = title;
    if (description !== undefined) card.description = description;
    if (priority !== undefined) card.priority = priority;
    if (status !== undefined) card.status = status;
    if (dueDate !== undefined) card.dueDate = dueDate;
    if (assignees !== undefined) card.assignees = assignees;

    await card.save();

    // Populate the card before sending response
    const updatedCard = await Card.findById(card._id)
      .populate('assignees', 'id name email avatar')
      .populate('column', 'id name')
      .populate('board', 'id name');

    res.json(updatedCard);
  } catch (err) {
    console.error('Card update error:', err);
    res.status(400).json({ 
      error: 'Failed to update card',
      details: err.message 
    });
  }
};

// Delete a card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this card' });
    }

    // Remove card from column
    await Column.findByIdAndUpdate(
      card.column,
      { $pull: { cards: card._id } }
    );

    // Delete the card
    await card.deleteOne();

    res.json({ message: 'Card deleted successfully' });
  } catch (err) {
    console.error('Card deletion error:', err);
    res.status(500).json({ 
      error: 'Failed to delete card',
      details: err.message 
    });
  }
};