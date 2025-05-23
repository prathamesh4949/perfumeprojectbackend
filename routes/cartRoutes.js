const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyToken = require('../middleware/authMiddleware');

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id }).populate({
      path: 'items.productId',
      select: 'name description price images brand gender size notes longevity rating averageRating reviews', // Populate all fields from Product
    });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }
    console.log('Backend cart response:', JSON.stringify(cart, null, 2)); // Debug log
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error fetching cart:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart: ' + err.message });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid productId or quantity' });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name description price images brand gender size notes longevity rating averageRating reviews',
    });
    console.log('Cart after adding item:', JSON.stringify(cart.toObject(), null, 2));
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add to cart: ' + err.message });
  }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put('/update', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ error: 'Invalid productId or quantity' });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name description price images brand gender size notes longevity rating averageRating reviews',
    });
    console.log('Cart after updating quantity:', JSON.stringify(cart.toObject(), null, 2));
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error updating cart:', err.message);
    res.status(500).json({ error: 'Failed to update cart: ' + err.message });
  }
});

// @route   DELETE /api/cart/remove
// @desc    Remove item from cart
// @access  Private
router.delete('/remove', verifyToken, async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name description price images brand gender size notes longevity rating averageRating reviews',
    });
    console.log('Cart after removing item:', JSON.stringify(cart.toObject(), null, 2));
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error removing from cart:', err.message);
    res.status(500).json({ error: 'Failed to remove from cart: ' + err.message });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear user's cart
// @access  Private
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name description price images brand gender size notes longevity rating averageRating reviews',
    });
    console.log('Cart after clearing:', JSON.stringify(cart.toObject(), null, 2));
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (err) {
    console.error('Error clearing cart:', err.message);
    res.status(500).json({ error: 'Failed to clear cart: ' + err.message });
  }
});

// @route   POST /api/cart/sync
// @desc    Sync cart with frontend state
// @access  Private
router.post('/sync', verifyToken, async (req, res) => {
  const { items } = req.body;

  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    cart.items = items.map(item => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    await cart.save();
    await cart.populate({
      path: 'items.productId',
      select: 'name description price images brand gender size notes longevity rating averageRating reviews',
    });
    console.log('Cart after syncing:', JSON.stringify(cart.toObject(), null, 2));
    res.status(200).json(cart);
  } catch (err) {
    console.error('Error syncing cart:', err.message);
    res.status(500).json({ error: 'Failed to sync cart: ' + err.message });
  }
});

module.exports = router;