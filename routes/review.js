const express = require("express"),
    router = express.Router({ mergeParams: true }),
    Campground = require("../models/campground"),
    Review = require("../models/review"),
    middleware = require("../middleware");

// Reviews Index
router.get("/", function (req, res) {
    Campground.findOne({ slug: req.params.slug }).populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } }                            // sorting the populated reviews array to show the latest first
    }).exec(function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", { campground: foundCampground });
    });
});

// Reviews New
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    // middleware.checkReviewExistence checks if a user already reviewed the campground
    Campground.findOne({ slug: req.params.slug }, function (err, foundCampground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", { campground: foundCampground })
    });
});

// Reviews Create
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    // find campground by id
    Campground.findOne({ slug: req.params.slug }).populate("reviews").exec(function (err, foundCampground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            Review.create(req.body.review, function (err, review) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                } else {
                    // add author username/id and associated campground to the review
                    review.author.id = req.user._id;
                    review.author.username = req.user.username;
                    review.campground = foundCampground;
                    //save review
                    review.save();
                    foundCampground.reviews.push(review);
                    //calculate new average review for campground
                    foundCampground.rating = calculateAverage(foundCampground.reviews);
                    //save campground
                    foundCampground.save();
                    req.flash("success", "Successfully added review");
                    res.redirect("/campgrounds/" + foundCampground.slug);
                }
            });
        }
    });
});

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            res.render("reviews/edit", { campground_slug: req.params.slug, review: foundReview })
        }
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, { new: true }, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findOne({ slug: req.params.slug }).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", req.message);
                return res.redirect("back");
            }
            //recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Successfully updated review");
            res.redirect("/campground/" + campground.slug);
        });
    });
});

// Reviews Delete
router.delete("/:reviews_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            Campground.findOne({ slug: req.params.slug }, { $pull: { reviews: req.params.review_id } }, { new: true }).populate("reviews").exec(function (err, foundCampground) {
                if (err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                } else {
                    //recalculate campground average
                    foundCampground.rating = calculateAverage(foundCampground.reviews);
                    //save changes
                    foundCampground.save();
                    req.flash("success", "Review successfully deleted");
                    res.redirect("/campgrounds/" + foundCampground.slug);
                }
            });
        }
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;