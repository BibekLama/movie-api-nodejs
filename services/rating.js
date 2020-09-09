const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Movie = require('../models/Movie');

exports.addRatingToMovie = (req, res, next) => {
    const body = req.body

    const rating = new Rating({
        _id: new mongoose.Types.ObjectId(),
        movie: body['movieId'],
        userId: body['userId'],
        rating: body['rating'],
        summary: body['summary']
    });

    rating.save().then(
        result => {
            Movie.updateOne({_id: body['movieId']}, {$inc : {'ratingCount' : 1, 'ratingValue' : body['rating']}})
                .exec()
                .then(rs => { 
                    res.status(201).json({
                        message: "Rating Added",
                        data: result
                    });
                })
        }
    ).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
};


exports.userRatingList = (req, res, next) => {
    const id = req.params.id;
    Rating.find({userId: id})
        .select('_id movie userId rating summary createdAt')
        .populate('movie')
        .exec()
        .then(doc => {
            if(doc){
                const response = {
                    count: doc.length,
                    data: doc
                }
                res.status(201).json(response);
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

exports.movieRatingList = (req, res, next) => {
    const id = req.params.id;
    Rating.find({movie: id})
        .select('_id userId rating summary createdAt')
        .exec()
        .then(doc => {
            if(doc){
                const response = {
                    count: doc.length,
                    data: doc
                }
                res.status(201).json(response);
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