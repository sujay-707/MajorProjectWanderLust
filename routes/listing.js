const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); // Wrap async errors
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js"); // Import listing schema for validation
const Listing = require("../models/listing.js"); // Import the Listing model
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { use } = require("passport");

const listingController = require("../controllers/listings.js");

const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage}); 

// index and create route
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );


// New listing form route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show update delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

// Edit listing form route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
