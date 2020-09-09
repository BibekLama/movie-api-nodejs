const express = require('express');
const router = express.Router();
const ratingService = require('../services/rating');


/* URL: /ratings
Method: POST
Description: Add user rating to movie*/
router.post('/', ratingService.addRatingToMovie);

/* URL: /ratings/users/{id}
Method: GET
Description: List all the user rated movies */
router.get('/users/:id', ratingService.userRatingList);

/* URL: /ratings/movies/{id}
Method: GET
Description: List all the movie rated users */
router.get('/movies/:id', ratingService.movieRatingList);

module.exports = router