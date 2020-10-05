const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Movie = require('../models/Movie');

exports.addRatingToMovie = async (req, res, next) => {
    const body = req.body

    const rating = new Rating({
        _id: new mongoose.Types.ObjectId(),
        movieId: body['movieId'],
        userId: body['userId'],
        rating: body['rating'],
        summary: body['summary']
    });

    let rate = await Rating.find({userId: body['userId'], movieId: body['movieId']});
    console.log(rate)
    if(rate.length > 0 && rate[0].userId === body['userId'] && rate[0].movieId === body['movieId']){
        res.status(500).json({
            message: "Already rated to this movie"
        });
    }

    rating.save().then(
        result => {
            Movie.updateOne({movieId: body['movieId']}, {$inc : {'ratingCount' : 1, 'ratingValue' : body['rating']}})
                .exec()
                .then(rs => { 
                    res.status(201).json({
                        message: "Rating Added",
                        data: result
                    });
                })
        }
    ).catch(err => {
        console.log(err.message);
        res.status(500).json({
            error: err
        });
    });
};


exports.userRatingList = (req, res, next) => {
    const id = req.params.id;
    Rating.find({userId: id})
        .select('_id movieId userId rating summary createdAt')
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
    Rating.find({movieId: id})
        .select('_id movieId, userId rating summary createdAt')
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