const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyToken = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Place an order
// @access  Private
router.post('/', verifyToken, async (req, res) => {
  const { items, total } = req.body;

  try {
    // Basic validation
    if (!items || items.length === 0 || !total) {
      return res.status(400).json({ error: 'Items and total are required' });
    }

    const order = new Order({
      userId: req.user.id,
      items: items.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      total,
    });

    await order.save();
    res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders for the logged-in user
// @access  Private
router.get('/', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'name price images')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Delete an order if within 24 hours of creation
// @access  Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const hoursDiff = (now - orderDate) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(403).json({ message: "It's too late, we cannot delete it." });
    }

    await Order.deleteOne({ _id: req.params.id, userId: req.user.id });
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;