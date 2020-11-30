# A full stack application built as part of Colt Steele's Web Developer Bootcamp course.

## Built on a MongoDB/Express/Node stack, utilizing RESTful architecture, Bootstrap 4 for styling, and Passport.js for authentication, among other libraries and packages for miscellaneous features.

### Features:

* Functionalities of Campground posts, comments, reviews, and user profiles:
   * CRUD - Users can Create, View, Edit/Update and Delete campground posts, comments, and reviews.
   * Users can create a profile which includes more information on the user (full name, avatar, email, phone, join date), a list of their campground posts, and the option to edit their profile or delete their account.

* Authentication:
   * Users can sign up by creating an account with a username and password.
   * Users can log in using their unique username and password combination.
   * Admins can log in with an admin username, password, and admin code.
   * Passport.js is utilize as the authentication middleware of choice for Node.js.

* Authorization:
   * Users cannot create new Campground posts or view user profiles without being authenticated/signed in.
   * Users cannot edit/update or delete existing Campground posts/comments/reviews that belong to other users.
   * Admins have the ability to manage all posts/comments/reviews regardless if they own them or not.

* Miscellaneous features:
   * Users can search for a campground by name.
   * Responsive web design including support for smaller screen sizes (tablets/mobiles).
   * Embedded comments and reviews on each Campground's show page.
   * RESTful routing including bringing the user back to the Campground show page they were on after they submit a comment or review.
   * Error catching and validation to make the website user-friendly and more functional, aided in part through use of flash messages that provide alerts to the user based on their interaction with the app.
   * A 'like button' which users can click to 'like' a Campground. Another button displays a list of all users who have liked the Campground.
   * Use of Clean URLs (aka RESTful URLs) which are considered more intuitive/user-friendly - semantic URLs instead of Campground IDs.
   * Use of Moment.js to display the time since a Campground post/comment/review was made.
