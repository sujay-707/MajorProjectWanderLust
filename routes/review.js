const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing"); // Import Listing model
const Review = require("../models/review"); // Import Review model

const wrapAsync = require("../utils/wrapAsync.js"); // Utility to wrap async functions
const ExpressError = require("../utils/ExpressError.js"); // Custom error class
const { validateReview, isLoggedIn , isReviewAuthor} = require("../middleware.js");


const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");


// Post Route for adding a review
router.post(
  "/", // URL should include :id to specify which listing to add a review to
  validateReview,
  wrapAsync(reviewController.createReview)
);

// Delete Route for removing a review
router.delete(
  "/:reviewId", 
  isLoggedIn,
  isReviewAuthor,// URL includes both listing ID and review ID
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
