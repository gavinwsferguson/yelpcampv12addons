const mongoose = require("mongoose");
const Campground = require("./models/campground");
const Comment   = require("./models/comment");
const Review    = require("./models/review");
 
const seeds = [
    {
        name: "Cloud's Rest", 
        image: "https://farm4.staticflickr.com/3795/10131087094_c1c0a1c859.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: {
            id: "588c2e092403d111454fff76",
            username: "Moody"
        }
    },
    {
        name: "Desert Mesa", 
        image: "https://farm6.staticflickr.com/5487/11519019346_f66401b6c1.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: {
            id: "588c2e092403d111454fff71",
            username: "Luna"
        }
    },
    {
        name: "Canyon Floor", 
        image: "https://farm1.staticflickr.com/189/493046463_841a18169e.jpg",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum",
        author: {
            id: "588c2e092403d111454fff77",
            username: "Fleur"
        }
    }
]
 
// Refactor seedDB() function using modern ES syntax - async/await with try/catch for error handling
async function seedDB() {
    try {
        await Campground.deleteMany({});
        console.log("campgrounds removed");
        await Comment.deleteMany({});
        console.log("comments removed");
        await Review.deleteMany({});
        console.log("reviews deleted");
        // for (const seed of seeds) {
        //     let campground = await Campground.create(seed);
        //     console.log("campground created");
        //     let comment = await Comment.create(
        //         {
        //             text: "This place is great, but I wish there was internet",
        //             author: {
        //                 id: "588c2e092403d111454fff76",
        //                 username: "Moody"
        //             }
        //         });
        //     console.log("comment created");
        //     campground.comments.push(comment);
        //     campground.save();
        //     console.log("comment added to campground");
        // }
    } catch (err) {
        console.log(err);
    }
}

// Original seedDB() function
// function seedDB(){
//     //Remove all campgrounds
//     Campground.deleteMany({}, function(err){
//          if(err){
//              console.log(err);
//          }
//          console.log("removed campgrounds!");
//          Comment.deleteMany({}, function(err) {
//              if(err){
//                  console.log(err);
//              }
//              console.log("removed comments!");
//               //add a few campgrounds
//              data.forEach(function(seed){
//                  Campground.create(seed, function(err, campground){
//                      if(err){
//                          console.log(err)
//                      } else {
//                          console.log("added a campground");
//                          //create a comment
//                          Comment.create(
//                              {
//                                  text: "This place is great, but I wish there was internet",
//                                  author: {
//                                      id: "588c2e092403d111454fff76",
//                                      username: "Moody" 
//                                  }
//                              }, function(err, comment){
//                                  if(err){
//                                      console.log(err);
//                                  } else {
//                                      campground.comments.push(comment);
//                                      campground.save();
//                                      console.log("Created new comment");
//                                  }
//                              });
//                      }
//                  });
//              });
//          });
//      }); 
//      //add a few comments
//  }
 
module.exports = seedDB;
