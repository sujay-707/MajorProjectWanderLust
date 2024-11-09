const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview = async (req, res) => {
  let listing = await Listing.findById(req.params.id); // Find the listing by ID
  let newReview = new Review(req.body.review); // Create new review
  newReview.author = req.user._id;
  console.log(newReview);
  listing.reviews.push(newReview); // Add review to the listing
  await newReview.save(); // Save the review
  await listing.save(); // Save the updated listing
  req.flash("success", "New Review Created");

  res.redirect(`/listings/${listing._id}`); // Redirect to the listing's show page
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params; // Destructure the listing and review IDs
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove the review reference from the listing
  await Review.findByIdAndDelete(reviewId); // Delete the actual review from the Review collection
  req.flash("success", "Review Deleted");
  res.redirect(`/listings/${id}`); // Redirect to the listing's show page
};
