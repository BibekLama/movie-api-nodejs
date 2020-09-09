const express = require('express');
const router = express.Router();
const multer = require('multer');
const movieService = require('../services/movie');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        return callback(null, './uploads/');
    },
    filename: (req, file, callback) => {
        return callback(null, Date.now()+'-'+file.originalname)
    }
});

const fileFilter = (req, file, callback) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif'){
        return callback(null, true);
    }else{
        return callback(new Error("Only jpg, png, gif file is allowed"), false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

/* URL: /movies
Method: GET
Description: List all the movies */
router.get('/', movieService.movieList);

/* URL: /movies
Method: POST
Description: Add new movie */
router.post('/', upload.single('img'), movieService.addMovie);

/* URL: movies/{id}
Method: PATCH
Parameter: id
Description: Update movie detail by id */
router.patch('/:id', upload.single('img'), movieService.updateMovie);

/* URL: movies/{id}
Method: DELETE
Parameter: id
Description: Delete movie by id */
router.delete('/:id', movieService.deleteMovie);

/* URL: movies/{id}
Method: GET
Parameter: id
Description: Get single movie by id */
router.get('/:id', movieService.getMovieById);

/* URL: movies/id/{id}
Method: GET
Parameter: id
Description: Get single movie by id */
router.get('/id/:id', movieService.getMovieBymovieId);

module.exports = router