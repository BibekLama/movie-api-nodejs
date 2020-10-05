const express = require('express');

const http = require('http');

const morgan = require('morgan');

const bodyParser = require('body-parser');

const path = require('path');

const cors = require('cors')

require('dotenv').config();

const connection = require('./middlewares/connection');

const app = express();

const server = http.createServer(app);

app.use(morgan('dev'));

app.disable('etag');

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

connection.connect();

var uploadPath = path.join(__dirname, './uploads');
app.use('/uploads', express.static(uploadPath));

app.use(function (req, res, next) {
    console.log(req.headers.origin)
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

// Routes
const movieRoutes = require('./routes/movie');
app.use('/movies', movieRoutes);

const ratingRoutes = require('./routes/rating');
app.use('/ratings', ratingRoutes);

const genreRoutes = require('./routes/genre');
app.use('/genres', genreRoutes);

app.use((req, res, next) => {
    const error = new Error("Not Found!!");
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});


server.listen(process.env.PORT || 5000, () => {
    console.log(`Server listening at ${process.env.HOST}:${process.env.PORT || 5000}`)
});