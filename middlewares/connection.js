const mongoose = require('mongoose');

const connection = {};
var conn = false;

connection.connect = async () => {

    try {
        conn = await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }

}

connection.close = () => {
    mongoose.connection.close();
}

module.exports = connection;