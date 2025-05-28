const Board = require('../models/Board');
const Column = require('../models/Column');
const User = require('../models/User');

exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ members: req.user.id })
      .populate('members', 'id name email avatar')
      .sort({ lastModified: -1 });
    
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

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

    // Add board to user's boards array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { boards: board._id } }
    );
    
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

exports.updateBoard = async (req, res) => {
  try {
    const { name, description, thumbnailColor } = req.body;
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user is a member of the board
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to update this board' });
    }

    // Update fields if provided
    if (name) board.name = name;
    if (description) board.description = description;
    if (thumbnailColor) board.thumbnailColor = thumbnailColor;

    await board.save();
    res.json(board);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Check if user is a member of the board
    if (!board.members.includes(req.user.id)) {
      return res.status(403).json({ error: 'Not authorized to delete this board' });
    }

    // Remove board from all members' boards array
    await User.updateMany(
      { boards: board._id },
      { $pull: { boards: board._id } }
    );

    // Delete all columns and their cards
    await Column.deleteMany({ board: board._id });

    // Delete the board
    await board.deleteOne();

    res.json({ message: 'Board deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};