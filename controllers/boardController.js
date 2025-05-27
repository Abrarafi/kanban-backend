const Board = require('../models/Board');
const Column = require('../models/Column');

exports.createBoard = async (req, res) => {
  try {
    const { name, description, thumbnailColor } = req.body;
    
    const board = new Board({
      name,
      description,
      thumbnailColor,
      createdBy: req.user.id,
      members: [req.user.id]
    });
    
    // Create default columns
    const defaultColumns = [
      { name: 'To Do', order: 0, board: board._id },
      { name: 'In Progress', order: 1, board: board._id },
      { name: 'Done', order: 2, board: board._id }
    ];
    
    const columns = await Column.insertMany(defaultColumns);
    board.columns = columns.map(col => col._id);
    await board.save();
    
    res.status(201).json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate({
        path: 'columns',
        populate: {
          path: 'cards',
          populate: {
            path: 'assignees',
            select: 'id name avatar'
          }
        }
      })
      .populate('members', 'id name email avatar');
      
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};