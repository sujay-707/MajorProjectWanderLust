if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const port = 8080;
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const ejsMate = require("ejs-mate");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public"))); // Serve static files from "public"


// MongoDB connection


const dbUrl = process.env.ATLASDB_URL;
main()
  .then(() => {
    console.log("MongoDB connection established");
  })
  .catch((err) => {
    console.log("Connection failed:", err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR  in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

// Root route
// app.get("/", (req, res) => {
//   res.send("Success! Connection is running.");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demoUser" , async (req , res) =>
// {
//   let fakeUser = new User({
//     email : "sujaymundaragi7@gmail.com",
//     username : "sujay123"
//   })

//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);

// })

// Import routes
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");



// Use routes
app.use("/listings", listingRouter); // Listing routes
app.use("/listings/:id/reviews", reviewRouter); // Review routes
app.use("/", userRouter);

// Catch-all route for undefined routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;
  res.status(statusCode).render("error.ejs", { message });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
