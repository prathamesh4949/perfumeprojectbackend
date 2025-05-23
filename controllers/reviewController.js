const Review = require('../models/Review');

exports.getReviews = async (req, res) => {
  const reviews = await Review.find({ productId: req.params.productId });
  res.json(reviews);
};

exports.addReview = async (req, res) => {
  const newReview = new Review({ ...req.body, productId: req.params.productId });
  await newReview.save();
  res.status(201).json(newReview);
};
