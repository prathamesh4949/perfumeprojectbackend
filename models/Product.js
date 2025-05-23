const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true }, // Store username for display
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true, default: [] },
  rating: { type: Number, default: 4.5 }, // Legacy rating field, can be removed if not needed
  brand: { type: String, default: "Generic" },
  gender: { type: String, default: "Unisex" },
  size: { type: String, default: "100ml" },
  notes: { type: String, default: "Floral, Woody" },
  longevity: { type: String, default: "Moderate" },
  reviews: [reviewSchema], // Add reviews array
  averageRating: { type: Number, default: 0 }, // Add average rating field
});

// Use the existing 'perfume' collection
const Product = mongoose.model('Product', productSchema, 'perfume');

module.exports = Product;