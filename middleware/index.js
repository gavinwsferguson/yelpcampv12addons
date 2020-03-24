// all middleware ges here
const Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    Review = require("../models/review");
const middlewareObj = {};

// checkCampgroundOwnership function to authorise whether the user is allowed to edit/update/destroy campground
middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        // find the campground with provided ID
        Campground.findOne({ slug: req.params.slug }, function (err, foundCampground) {
            if (err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // does user own campground?
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

// checkCommentOwnership function to authorise whether the user is allowed to edit/update/destroy comment
middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        // find the comment with provided ID
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                // does user own comment?
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

// checkReviewOwnership function to authorise whether the user is allowed to edit/update/destroy review
middlewareObj.checkReviewOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        // find the review with provided ID
        Review.findById(req.params.review_id, function (err, foundReview) {
            if (err) {
                req.flash("error", "Review not found");
                res.redirect("back");
            } else {
                // does user own review?
                if (foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

// // checkReviewOwnership function to authorise whether the user is allowed to edit/update/destroy review
// middlewareObj.checkReviewOwnership = function (req, res, next) {
//     if (req.isAuthenticated()) {
//         Review.findById(req.params.review_id, function (err, foundReview) {
//             if (err || !foundReview) {
//                 console.log("ERROR 4");
//                 req.flash("error", "Review not found");
//                 console.log(err);
//                 res.redirect("back");
//             } else {
//                 // does user own review?
//                 if (foundReview.author.id.equals(req.user._id)) {
//                     next();
//                 } else {
//                     req.flash("error", "You don't have permission to do that");
//                     res.redirect("back");
//                 }
//             }
//         });
//     } else {
//         req.flash("error", "You need to be logged in to do that");
//         res.redirect("back");
//     }
// };

// checkReviewExistence function to authenticate whether a review already exists for user
middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findOne({ slug: req.params.slug }).populate("reviews").exec(function (err, foundCampground) {
            if (err) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                const foundUserReview = foundCampground.reviews.some(function (reviews) {
                    return reviews.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review");
                    return res.redirect("/campgrounds/" + Campground.slug);
                }
                // if the review was not found, go to next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

// isLoggedIn middleware function to authenticate whether the user is currently logged in or not
middlewareObj.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {              // if the user is logged in/authentication successful
        return next();                      // return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");                 // if user is not logged in/authentication unsuccessful, redirect to the login page
};

module.exports = middlewareObj;