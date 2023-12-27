const express = require('express');
const Review = require('../models/review')
const Campground = require('../models/campground')
const { validateReview, islogin, isReviewauthor } = require('../middlever')
const asyncError = require('../utils/asyncerror')
const router = express.Router({ mergeParams: true });
const review = require('../controllers/reviews')


router.post('/', islogin, validateReview, asyncError(review.createReview))
router.delete('/:rewId', islogin, isReviewauthor, asyncError(review.delete))
module.exports = router;