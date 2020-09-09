const express = require('express');
const router = express.Router();
const genreService = require('../services/genre');

/* URL: /genres
Method: GET
Description: List all the genres */
router.get('/', genreService.genreList);

/* URL: /genres
Method: GET
Description: List all the movie of genre */
router.get('/:genre', genreService.genreMovies);

/* URL: /genres
Method: POST
Description: Add genre*/
router.post('/', genreService.addGenre);

module.exports = router