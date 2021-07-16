const express = require('express');
const router = express.Router({mergeParams: true});
const {validateReview, isLoggedIn} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Restaurant = require('../models/restaurant');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js'); // JOI schema





router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // relate author to review
    restaurant.reviews.push(review);
    await review.save();
    await restaurant.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/restaurants/${restaurant._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Restaurant.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/restaurants/${id}`);
}))

module.exports = router;