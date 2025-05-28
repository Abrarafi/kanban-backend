const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  wip: { type: Number, default: null },
  color: { type: String, default: '#94a3b8' },
  board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  order: { type: Number, default: 0 },
  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }]
}, { timestamps: true });

// Index for faster queries
ColumnSchema.index({ board: 1, order: 1 });

module.exports = mongoose.model('Column', ColumnSchema);