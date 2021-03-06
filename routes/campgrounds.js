const express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    Review = require("../models/review"),
    middleware = require("../middleware");             // ../middleware/index is not needed as "index" is a special name and is the default file selected when pathing to a directory

// INDEX - show all campgrounds
router.get("/", function (req, res) {
    var perPage = 8;
    var pageQuery = parseInt(req.query.page);
    var pageNumber = pageQuery ? pageQuery : 1;
    var noMatch = null;
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        Campground.find({ name: regex }).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, campgrounds) {
            Campground.count({ name: regex }).exec(function (err, count) {
                if (err) {
                    console.log(err);
                    res.redirect("back");
                } else {
                    if (campgrounds.length < 1) {
                        noMatch = "No campgrounds match that query, please try again.";
                    }
                    res.render("campgrounds/index", {
                        campgrounds: campgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: req.query.search
                    });
                }
            });
        });
    } else {
        // get all campgrounds from DB
        Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, campgrounds) {
            Campground.count().exec(function (err, count) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("campgrounds/index", {
                        campgrounds: campgrounds,
                        current: pageNumber,
                        pages: Math.ceil(count / perPage),
                        noMatch: noMatch,
                        search: false
                    });
                }
            });
        });
    }
});

// CREATE - add new campground to DB -- POST route - same url (/campgrounds)
router.post("/", middleware.isLoggedIn, function (req, res) {
    // get data from form and add to campgrounds array
    const name = req.body.name;
    const price = req.body.price;
    const image = req.body.image;
    const desc = req.body.description;
    const author = {
        id: req.user._id,
        username: req.user.username
    }
    // store the user input from the form in an object, as a variable
    const newCampground = { name: name, price: price, image: image, description: desc, author: author };
    // create a new campground and save to DB
    Campground.create(newCampground, function (err, newlyCreated) {
        if (err) {
            console.log(err);
        } else {
            // redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

// NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:slug", function (req, res) {                                 // /:slug replaces /:id, can now find campground based on custom field (slug)
    // find the campground with provided ID, populate comments array
    Campground.findOne({ slug: req.params.slug }).populate("comments").populate("likes").populate({ path: "reviews", options: { sort: { createdAt: -1 } } }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            // render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });
});

// Campground Like Route
router.post("/:slug/like", middleware.isLoggedIn, function (req, res) {
    Campground.findOne({ slug: req.params.slug }, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user_id exists in foundCampgrounds.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // add the new user like
            foundCampground.likes.push(req.user);
            req.flash("success", "Liked!");
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground.slug);
        });
    });
});

// EDIT - show form to edit campground
router.get("/:slug/edit", middleware.checkCampgroundOwnership, function (req, res) {
    // find the campground with provided ID
    Campground.findOne({ slug: req.params.slug }, function (err, foundCampground) {
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});

// UPDATE - update campground with new info from edit campground form
router.put("/:slug", middleware.checkCampgroundOwnership, function (req, res) {
    // find and update the campground with provided ID
    Campground.findOne({ slug: req.params.slug }, function (err, updatedCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            updatedCampground.name = req.body.campground.name;
            updatedCampground.description = req.body.campground.description;
            updatedCampground.image = req.body.campground.image;
            updatedCampground.price = req.body.campground.price;
            updatedCampground.save(function (err) {                                     // campground.save triggers the 'pre save' hook defined in Campground model
                if (err) {                                                        // ..allows slug to update if campground name is modified
                    console.log(err);                                           // ..Campground.findByIdAndUpdate() or Campground.findOneAndUpate() would not trigger 'pre save' hook
                    res.redirect("/campgrounds");
                } else {
                    res.redirect("/campgrounds/" + updatedCampground.slug);
                }
            });
        }
    });
});

// DESTROY - remove campground from the database
router.delete("/:slug", middleware.checkCampgroundOwnership, function (req, res) {
    // destroy campground
    Campground.findOne({ slug: req.params.slug }, function (err, foundCampground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with campground
            Comment.remove({ "_id": { $in: foundCampground.comments } }, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                } else {
                    // deletes all reviews associated with campground
                    Review.remove({ "_id": { $in: foundCampground.reviews } }, function (err) {
                        if (err) {
                            console.log(err);
                            return res.redirect("/campgrounds");
                        } else {
                            // delete the campground
                            foundCampground.remove();
                            req.flash("success", "Successfully deleted campground");
                            res.redirect("/campgrounds");
                        }
                    });
                }
            });
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;