const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const helmet = require( 'helmet' ),
    server = express();
const globalErrorHandler = require('../src/controllers/Error/errorController');
const AppError = require('../src/utils/appError');

const { setRoutes } = require( './routes' );
// For security

server.use( helmet() );

const cors = require( 'cors' ),
    // Allow Origins according to your need.
    corsOptions = {
        'origin': '*'
    };

server.use( cors( corsOptions ) );

server.use( bodyParser.json() );


// Setting up Routes
setRoutes( server );

server.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
server.use(globalErrorHandler);

module.exports = { server };
