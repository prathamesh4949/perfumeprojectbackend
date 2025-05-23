const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const verifyToken = require('../middleware/authMiddleware');

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Calculate average rating if there are reviews
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = Number((totalRating / product.reviews.length).toFixed(1));
      await product.save();
    } else {
      product.averageRating = 0;
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a review to a product (authenticated users only)
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if the user has already reviewed this product
    const userReview = product.reviews.find(review => review.userId.toString() === req.user.id);
    if (userReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add the new review
    const newReview = {
      userId: req.user.id,
      username: req.user.name || 'Anonymous', // Use name from token or fallback
      rating: req.body.rating,
      comment: req.body.comment,
      createdAt: new Date(),
    };

    product.reviews.push(newReview);

    // Calculate and update average rating
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.averageRating = Number((totalRating / product.reviews.length).toFixed(1));
    }

    await product.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;