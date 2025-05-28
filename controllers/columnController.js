const Column = require('../models/Column');
const Board = require('../models/Board');

exports.getColumns = async (req, res) => {
  try {
    const columns = await Column.find({ board: req.params.boardId })
      .populate('cards')
      .sort({ order: 1 });
    
    res.json(columns);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getColumn = async (req, res) => {
  try {
    const column = await Column.findById(req.params.id)
      .populate('cards');
    
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    
    res.json(column);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createColumn = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const board = await Board.findById(req.params.boardId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    // Check if user is a member of the board
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to create columns in this board' });
    }
    
    // Get the highest order number
    const lastColumn = await Column.findOne({ board: req.params.boardId })
      .sort({ order: -1 });
    const order = lastColumn ? lastColumn.order + 1 : 0;
    
    const column = new Column({
      name,
      description,
      color,
      board: req.params.boardId,
      order
    });
    
    await column.save();
    
    // Add column to board
    board.columns.push(column._id);
    await board.save();
    
    res.status(201).json(column);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateColumn = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const column = await Column.findById(req.params.id);
    
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    
    // Check if user is a member of the board
    const board = await Board.findById(column.board);
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to update this column' });
    }
    
    // Update fields if provided
    if (name) column.name = name;
    if (description) column.description = description;
    if (color) column.color = color;
    
    await column.save();
    res.json(column);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteColumn = async (req, res) => {
  try {
    const column = await Column.findById(req.params.id);
    
    if (!column) {
      return res.status(404).json({ error: 'Column not found' });
    }
    
    // Check if user is a member of the board
    const board = await Board.findById(column.board);
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this column' });
    }
    
    // Remove column from board
    await Board.findByIdAndUpdate(
      column.board,
      { $pull: { columns: column._id } }
    );
    
    // Delete the column
    await column.deleteOne();
    
    res.json({ message: 'Column deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.reorderColumns = async (req, res) => {
  try {
    const { columnIds } = req.body;
    const board = await Board.findById(req.params.boardId);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    // Check if user is a member of the board
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to reorder columns in this board' });
    }
    
    // Update order for each column
    const updates = columnIds.map((columnId, index) => {
      return Column.findByIdAndUpdate(
        columnId,
        { order: index },
        { new: true }
      );
    });
    
    await Promise.all(updates);
    
    res.json({ message: 'Columns reordered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 