const mongoose = require('mongoose');
const Movie = require('./Movie');

const RatingSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    movie: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Movie'
    },
    userId: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    summary: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

RatingSchema.index({ movie: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('Rating', RatingSchema);