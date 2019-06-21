const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Variable to be sent to Frontend with Database status
let databaseConnection = 'Waiting for Database response...';
let retryTime = 2000;

router.get('/', function(req, res, next) {
    res.send(databaseConnection);
});

// Connecting to MongoDB
// mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
var connectWithRetry = () => {
    return mongoose.connect(
        process.env.MONGO_URL,
        { useNewUrlParser: true },
        err => {
            if (err) {
                retryTime *= retryTime;
                console.error(
                    'Failed to connect to mongo on startup - retrying in 5 sec',
                    err
                );
                setTimeout(connectWithRetry, 5000);
            }
        }
    );
};
connectWithRetry();

// If there is a connection error send an error message
mongoose.connection.on('error', error => {
    console.log('Database connection error:', error);
    setTimeout(connectWithRetry, retryTime);
    databaseConnection = 'Error connecting to Database';
});

// If connected to MongoDB send a success message
mongoose.connection.once('open', () => {
    console.log('Connected to Database!');
    databaseConnection = 'Connected to Database';
});

module.exports = router;
