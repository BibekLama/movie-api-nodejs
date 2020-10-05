const mongoose = require('mongoose');
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

exports.genreList = (req, res, next) => {
 
    Genre.find()
        .select('_id name createdAt')
        .sort({'createdAt': -1})
        .exec()
        .then(doc => {
            if(doc){
                const response = {
                    count: doc.length,
                    data: doc
                }
                res.status(201).json(response);
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        }); 
};

exports.getGenreById = (req, res, next) => {
    const id = req.params.id;
    Genre.findById(id)
    .select('_id name createdAt')
    .exec()
    .then(doc => { 
        if(doc){
            res.status(201).json({
                data: doc
            });
        }else{
            res.status(404).json({
                message: "No valid entry found for provided ID"
            });
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });  
};

exports.genreMovies = (req, res, next) => {
    const genreName = req.params.genre;
    Genre.findOne({name: genreName})
    .select('_id name movies createdAt')
    .populate('movies')
    .exec()
    .then(docs => {
        if(docs){
            const response = {
                count: docs.length,
                data: docs
            }
            res.status(201).json(response);
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.addGenre = (req, res, next) => {
    const genre = new Genre({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
    });

    genre.save().then(
        result => {
            res.status(201).json({
                message: "Genre Added",
                data: result,
                request: {
                    type: 'GET',
                    url: `${process.env.HOST}:${process.env.PORT}/genres/${result._id}`
                }
            });
        }
    ).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};

exports.updateGenre = async (req, res, next) => {
    const genreId = req.params.id;

    const genreBody = {
        name: req.body.name,
    };

    const genre = await Genre.findById(genreId);

    if(genre !== null){
        Genre.updateOne({_id: genreId}, {$set: genreBody})
        .exec()
        .then(result => {
                res.status(201).json({
                    message: "Genre Added",
                    data: result,
                    request: {
                        type: 'GET',
                        url: `${process.env.HOST}:${process.env.PORT}/genres/${result._id}`
                    }
                });
            }
        ).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }else{
        const error = new Error();
        error.message ="No valid entry found for provided ID";
        error.status = 404;
        res.json(error);
    }
};

exports.deleteGenre =  async (req, res, next) => {
    const id = req.params.id;

    const genre = await Genre.findById(id);
    
    if(genre !== null){
        Genre.deleteOne({_id: id})
        .exec()
        .then(result => {
            if(result.deletedCount > 0){
                res.status(200).json({
                    data: genre,
                    message: 'Genre Deleted'
                });
            }else{
                res.status(404).json({
                    message: "No valid entry found for provided ID"
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    }else{
        const error = new Error();
        error.message ="No valid entry found for provided ID";
        error.status = 404;
        res.json(error);
    }
};

exports.genresMoviesCount = (req, res, next) => {
   
    Genre.aggregate([
        {
            $group: {
                _id : "$name",
                y:  { $sum: {$size: "$movies"}}
            }
        }
    ])
    .then(docs => {
        console.log(docs)
        res.status(201).json({data: docs});
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};