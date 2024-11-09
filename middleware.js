const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema , reviewSchema} = require("./schema.js"); // Import listing schema for validation
const Review = require("./models/review.js");
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be Logged in..");
    res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner = async (req , res ,next) =>
{
  let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id))
    {
      req.flash("error" , "Permission Denied...! not a Owner ");
      return res.redirect(`/listings/${id}`);
    }

    next();
}

// Middleware to validate listing data
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    console.log("Validation Error:", errMsg); // Log validation error
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


// Validate review middleware
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};



module.exports.isReviewAuthor = async (req , res ,next) =>
  {
    let { id , reviewId } = req.params;
      let review = await Review.findById(reviewId);
      if(!review.author.equals(res.locals.currUser._id))
      {
        req.flash("error" , "Permission Denied for Review ! not a Owner ");
        return res.redirect(`/listings/${id}`);
      }
  
      next();
  }
  