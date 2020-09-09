const mongoose = require('mongoose');
const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

exports.genreList = (req, res, next) => {
 
    Genre.find()
        .select('_id name')
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

exports.genreMovies = async (req, res, next) => {
    const name = req.params.genre;

    const genre = await Genre.findOne({name: name});
    console.log(genre);
    if(genre !== null){
        Movie.find({ "genres":  genre._id})
            .select('_id movieId imgUrl ratingCount ratingValue genres createdAt')
            .populate('genres')
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
        }else{
            const error = new Error();
            error.message ="No valid entry found for provided genre";
            error.status = 404;
            res.json(error);
        }
};

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