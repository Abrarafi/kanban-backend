const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { 
    type: String, 
    enum: ['LOW', 'MEDIUM', 'HIGH', null], 
    default: null 
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Research', 'On Track', 'Completed'],
    default: 'Not Started'
  },
  dueDate: { type: Date, default: null },
  assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  column: { type: mongoose.Schema.Types.ObjectId, ref: 'Column', required: true },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true }
}, { timestamps: true });

// Indexes for performance
CardSchema.index({ column: 1 });
CardSchema.index({ board: 1 });

module.exports = mongoose.model('Card', CardSchema);