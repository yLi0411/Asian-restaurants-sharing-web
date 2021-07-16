const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const { restaurantSchema } = require('../schemas.js');
//const ExpressError = require('../utils/ExpressError');
const Restaurant = require('../models/restaurant');
const {isLoggedIn, isAuthor, validateRestaurant} = require('../middleware');



router.get('/', catchAsync(async (req, res) => {
    const restaurants = await Restaurant.find({});
    res.render('restaurants/index', { restaurants })
}));

router.get('/new', isLoggedIn, (req, res) => {

    res.render('restaurants/new');
})


router.post('/', isLoggedIn, validateRestaurant, catchAsync(async (req, res, next) => {
    // if (!req.body.restaurant) throw new ExpressError('Invalid Restaurant Data', 400);
    const restaurant = new Restaurant(req.body.restaurant);
    restaurant.author = req.user._id;
    await restaurant.save();
    req.flash('success', 'Successfully made a new restaurant!');
    res.redirect(`/restaurants/${restaurant._id}`)
}))

router.get('/:id', catchAsync(async (req, res,) => {
    const restaurant = await Restaurant.findById(req.params.id).populate('reviews').populate('author');// populate review and author
    if(!restaurant){
        req.flash('error', 'Cannot find that restaurant!');
        return res.redirect('/restaurants');
    }
    res.render('restaurants/show', { restaurant });
}));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params;
    const restaurant = await Restaurant.findById(id)

    if(!restaurant){
        req.flash('error', 'Cannot find that restaurant!');
        return res.redirect('/restaurants');
    }
    res.render('restaurants/edit', { restaurant });
}))

router.put('/:id', isLoggedIn, isAuthor, validateRestaurant, catchAsync(async (req, res) => {
    const { id } = req.params;

    const restaurant = await Restaurant.findByIdAndUpdate(id, { ...req.body.restaurant });
    req.flash('success', 'Successfully updated restaurants');
    res.redirect(`/restaurants/${restaurant._id}`)
}));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Restaurant.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted restaurant');
    res.redirect('/restaurants');
}));

module.exports = router;