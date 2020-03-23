const express = require("express"),
      router = express.Router({ mergeParams: true }),
      Campground = require("../models/campground"),
      Comment = require("../models/comment"),
      middleware = require("../middleware");

// NEW - show form to add a comment to a campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    // find campground by id and render the form
    Campground.findOne({slug: req.params.slug}, function (err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { campground: campground });
        }
    });
});

// CREATE - add a comment to the current campground
router.post("/", middleware.isLoggedIn, function (req, res) {
    // find campground by id
    Campground.findOne({slug: req.params.slug}, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // create new comment, push to the campground.comments array, save it, then redirect to the campgrounds show page
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    req.flash("error", "Something went wrong");
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground.slug);
                }
            });
        }
    });
});

// EDIT - show form to edit comment
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", { campground_slug: req.params.slug, comment: foundComment });
        }
    });
});

// UPDATE - update comment with new info from edit comment form
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.slug);
        }
    });
});

// DESTROY - remove comment from the campground and database
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    // destroy comment
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            // then, redirect to campground show page
            res.redirect("/campgrounds/" + req.params.slug);
        }
    });
});

module.exports = router;