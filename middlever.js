const ExpressError = require('./utils/ExpressError')
const { campgroundSchema,reviewSchema } = require('./schma.js')
const Campground = require('./models/campground')
const Review=require('./models/review')

module.exports.checkReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
}

module.exports.islogin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must sign in');
    return res.redirect('/login')
  }
  next();
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
  } else {
      next();
  }
}



module.exports.isauthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}
module.exports.isReviewauthor = async (req, res, next) => {
  const {id,rewId } = req.params;
  const review = await Review.findById(rewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that!')
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}

module.exports.validateCamp = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}