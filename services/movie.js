const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const fs = require('fs');

exports.movieList = (req, res, next) => {
    Movie.find()
        .sort({createdAt: 'descending'})
        .select('_id movieId imgUrl ratingCount ratingValue genres createdAt')
        .populate('genres')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                data: docs.map(doc => {
                    return {
                        _id: doc._id,
                        movieId: doc.movieId,
                        imgUrl: doc.imgUrl,
                        ratingCount: doc.ratingCount,
                        ratingValue: doc.ratingValue,
                        genres: doc.genres,
                        createdAt: doc.createdAt,
                        average: doc.ratingValue / doc.ratingCount,
                        request: {
                            type: 'GET',
                            url: `${process.env.HOST}movies/${doc._id}`
                        }
                    }
                })
            };
            res.status(201).json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
              error: err
            });
        });
};

exports.movieRatingList = async (req, res, next) => {
    let limit = parseInt(req.params.limit);
    let count = await Movie.countDocuments({});
    if(limit === 0){
        limit = count
    }
    console.log(limit)
    Movie.aggregate([
        {
            "$addFields": {
            ratingAvg: { $cond: [ { $eq: [ "$ratingCount", 0 ] }, 0, {"$divide":["$ratingValue", "$ratingCount"]} ] }
            }
        },
        { 
            "$sort": {
                ratingAvg: -1
            }
        },
        {
            $lookup:
              {
                from: "genre",
                localField: "genres",
                foreignField: "_id",
                as: "genres"
              }
        },
        {$limit : limit}
    ])
    .then(docs => {
        const response = {
            count: docs.length,
            data: docs.map(doc => {
                return {
                    _id: doc._id,
                    movieId: doc.movieId,
                    imgUrl: doc.imgUrl,
                    ratingCount: doc.ratingCount,
                    ratingValue: doc.ratingValue,
                    genres: doc.genres,
                    createdAt: doc.createdAt,
                    average: doc.ratingValue / doc.ratingCount,
                    request: {
                        type: 'GET',
                        url: `${process.env.HOST}movies/${doc._id}`
                    }
                }
            })
        };
        res.status(201).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};


const movieById = (id) => {
    return Movie.findById(id)
    .select('_id movieId img imgUrl ratingCount ratingValue createdAt')
    .exec()
    .then(doc => { 
        if(doc){
           return doc;
        }else{
            return null;
        }
    })
    .catch(err => {
        console.log(err);
        return null;
    });  
}

exports.getMovieById = (req, res, next) => {
    const id = req.params.id;
    Movie.findById(id)
    .select('_id movieId imgUrl ratingCount ratingValue genres createdAt')
    .populate('genres')
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

exports.getMovieBymovieId = (req, res, next) => {
    const id = req.params.id;
    Movie.findOne({movieId: id})
    .select('_id movieId imgUrl ratingCount ratingValue genres createdAt')
    .populate('genres')
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


exports.addMovie = (req, res, next) => {
    const movie = new Movie({
        _id: new mongoose.Types.ObjectId(),
        movieId: req.body.movieId,
        img: req.file ? req.file.filename : '',
        imgUrl: req.file ? process.env.HOST+"/"+req.file.path : '',
        genres: req.body.genres != undefined && req.body.genres.length > 0 ? req.body.genres : [],
        ratingCount: 0,
        ratingValue: 0
    });
    movie.save().then(
        async result => {
            result.genres.map(async item => {
                await Genre.updateOne({_id: item }, {$addToSet: { movies: result._id}})
            })
            res.status(201).json({
                message: "Movie Added",
                data: result,
                request: {
                    type: 'GET',
                    url: `${process.env.HOST}movies/${result._id}`
                }
            });
        }
    ).catch(err => {
        console.log(err);
        if(req.file){
            fs.unlink(req.file.path, (er) => {
                console.log(er);
                res.status(500).json({
                    error: err
                });
            });
        }
    });
};


exports.updateMovie  = (req, res, next) => {
    const movieId = req.params.id;
    const updateData = {};
    Movie.findOne({movieId: movieId})
        .then(movie => {
            updateData['img'] = req.file ? req.file.filename : movie.img;
            updateData['imgUrl'] = req.file ? `${process.env.HOST}/${req.file.path}` : movie.imgUrl;

            Movie.updateOne({_id: movie._id,}, { $pull: { genres: { $in: movie.genres } } })
            .then(re => {
                Movie.updateOne({_id: movie._id,}, {$set: updateData, $addToSet: { genres: req.body.genres}})
                .exec()
                .then(async result => { 
                    let mov = await Movie.findById(movie._id);
                    mov.genres.map(async item => {
                        await Genre.updateOne({_id: item }, {$addToSet: { movies: movie._id}})
                    })
                    
                    if(result){
                        if(req.file && movie.img){
                            fs.unlink(`./uploads/${movie.img}`, (er) => {
                                console.log(er);
                            });
                        }

                        Movie.findOne({movieId: movieId})
                        .then(mov => {
                            res.status(200).json({
                                movie:mov,
                                message: 'Movie updated',
                                request: {
                                    type: 'GET',
                                    url: `${process.env.HOST}movies/id/${movieId}`
                                }
                            })
                        })
                        .catch(err => {
                            res.status(500).json({
                                movie,
                                error: err
                            });
                        });
                    }else{
                        res.status(404).json({
                            message: "No valid entry found for provided ID"
                        });
                    }
                })
                .catch(err => {
                    console.log(err);
                    debugger
                    if(req.file){
                        fs.unlink(req.file.path, (er) => {
                            console.log(er);
                            res.status(500).json({
                                error: err
                            });
                        });
                    }
                });
            })
        })
        .catch(error => {
            res.json(error);
        });
};



exports.deleteMovie =  async (req, res, next) => {
    const id = req.params.id;

    const movie = await Movie.findOne({movieId: id});
    
    if(movie !== null){
        Movie.deleteOne({_id: movie.id})
        .exec()
        .then(result => {
            if(result.deletedCount > 0){
                if(movie.img){
                    fs.unlink(`./uploads/${movie.img}`, (er) => {
                        console.log(er);
                    });
                }
                console.log(movie)
                movie.genres.map(async item => {
                   await Genre.updateOne({_id: item}, {$pull: {movies: {$in: [movie._id]}}})
                })
                res.status(200).json({
                    data: movie,
                    message: 'Movie Deleted'
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
