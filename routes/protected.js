const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protected route: /dashboard
router.get('/dashboard', authMiddleware, (req, res) => {
  res.json({
    message: '🌟 Welcome to the protected dashboard!',
    userId: req.user.id,  // `req.user` is populated by the authMiddleware
  });
});

module.exports = router;
