const Review = require('../models/review')
const Campground = require('../models/campground')

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${campground._id}`)
}
module.exports.delete = async (req, res) => {
    const { id, rewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: rewId } });
    await Review.findByIdAndDelete(rewId)
    res.redirect(`/campgrounds/${id}`)
}