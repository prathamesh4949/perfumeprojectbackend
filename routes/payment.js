const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51QBIT3Fhq5GgAyUbG9kW8iQJ7jD2nO5ZxX8pL2mV0cH3fY9uW1rT5vN4qP8sL9xM0tK2jE3hG4iU5yT6zR7xS8vW00aBcDeFKn');
const verifyToken = require('../middleware/authMiddleware');

// @route   POST /api/payment/create-checkout-session
// @desc    Create a Stripe Checkout Session
// @access  Public
router.post('/create-checkout-session', async (req, res) => {
  const { items, user } = req.body;

  if (!user || !items || items.length === 0) {
    return res.status(400).json({ error: 'Invalid request: user and items are required' });
  }

  try {
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const cartItemsSerialized = JSON.stringify(
      items.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    console.log('Storing userId in Stripe session metadata:', user._id);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/checkout',
      customer_email: user?.email || undefined,
      metadata: {
        userId: String(user._id),
        cartItems: cartItemsSerialized,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: 'Failed to create checkout session: ' + error.message });
  }
});

// @route   GET /api/payment/verify-session/:sessionId
// @desc    Verify a Stripe Checkout Session
// @access  Private
router.get('/verify-session/:sessionId', verifyToken, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    console.log('Comparing session.metadata.userId:', session.metadata.userId);
    console.log('With req.user.id:', req.user.id);

    const sessionUserId = String(session.metadata.userId).trim();
    const requestUserId = String(req.user.id).trim();

    if (sessionUserId !== requestUserId) {
      console.error('User ID mismatch:', { sessionUserId, requestUserId });
      return res.status(403).json({ error: 'Unauthorized access to payment session' });
    }

    res.json({
      metadata: session.metadata,
      payment_status: session.payment_status,
    });
  } catch (error) {
    console.error('Error verifying checkout session:', error.message);
    res.status(500).json({ error: 'Failed to verify checkout session: ' + error.message });
  }
});

module.exports = router;