const express       = require("express"),
      app           = express(),
      mongoose      = require("mongoose"),
      flash         = require("connect-flash"),
      passport      = require("passport"),
      LocalStrategy = require("passport-local"),
      methodOverride = require("method-override"),
      Campground    = require("./models/campground"),
      Comment       = require("./models/comment"),
      User          = require("./models/user"),
      seedDB        = require("./seeds");

// requiring routes
const campgroundRoutes = require("./routes/campgrounds"),
      commentRoutes    = require("./routes/comments"),
      reviewRoutes     = require("./routes/review"),
      indexRoutes      = require("./routes/index");


// connect to the database
mongoose.connect("mongodb://localhost:27017/yelp_camp_v12_addons", { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
// HTML forms do not support anything other than a GET or POST request, so we need a workaround to allow a PUT request for the UPDATE route
// Method-Override listens for "_method" (can be anything) and overrides the form method with the specified method (in this case, PUT)
seedDB(); //seed the database

// Passport configuration
app.use(require("express-session")({
    secret: "Yet another secret phrase!",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));       // User.authenticate() method comes from PassportLocalMongoose
passport.serializeUser(User.serializeUser());               // User.serializeUser() method comes from PassportLocalMongoose
passport.deserializeUser(User.deserializeUser());           // User.deserializeUser() method comes from PassportLocalMongoose
// req.user contains username & id of current user if signed in, if not signed in it will be empty
app.use(function(req, res, next){                           // app.use calls this function on every route, prevents have to pass currentUser through all routes
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:slug/comments", commentRoutes);
app.use("/campgrounds/:slug/reviews", reviewRoutes);

// Tell Express to listen for requests (starts server)
// listen on PORT 3000
app.listen(3000, function () {
    console.log("YelpCamp server has started!  Press Ctrl^C to exit.");
});