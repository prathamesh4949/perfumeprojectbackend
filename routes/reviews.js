const express = require('express');
const router = express.Router();
const { getReviews, addReview } = require('../controllers/reviewController');

router.get('/:productId', getReviews);
router.post('/:productId', addReview);

module.exports = router;
