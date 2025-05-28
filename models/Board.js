const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnailColor: { type: String, default: '#6366f1' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  columns: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Column' }],
  lastModified: { type: Date, default: Date.now }
}, { timestamps: true });

// Update lastModified when board changes
BoardSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

module.exports = mongoose.model('Board', BoardSchema);