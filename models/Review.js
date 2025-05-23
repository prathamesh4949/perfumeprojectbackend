const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: mongoose.Schema.Types.ObjectId,
  user: String,
  comment: String,
  rating: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', reviewSchema);
