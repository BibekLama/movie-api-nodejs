const express = require('express');
const router = express.Router();
const genreService = require('../services/genre');

/* URL: /genres
Method: GET
Description: List all the genres */
router.get('/', genreService.genreList);

/* URL: /genres
Method: GET
Description: Get single genre by id */
router.get('/:id', genreService.getGenreById);

/* URL: /genres
Method: GET
Description: List all the movie of genre */
router.get('/movies/:genre', genreService.genreMovies);

/* URL: /genres
Method: GET
Description: Count of movies in genre */
router.get('/chart/genres', genreService.genresMoviesCount);

/* URL: /genres
Method: POST
Description: Add genre*/
router.post('/', genreService.addGenre);

/* URL: /genres
Method: PATCH
Description: Update genre*/
router.patch('/:id', genreService.updateGenre);

/* URL: /genres
Method: PATCH
Description: Delete genre*/
router.delete('/:id', genreService.deleteGenre);

module.exports = router