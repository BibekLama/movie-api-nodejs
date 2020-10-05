const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    movieId: {
        type: Number,
        required: true,
        unique: true
    },
    img: {
        type: String
    },
    imgUrl: {
        type: String
    },
    ratingCount: {
        type: Number
    },
    ratingValue: {
        type: Number
    },
    genres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Movie', MovieSchema);