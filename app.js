/*jslint node: true*/

// app.js Node.js server
'use strict';

var config = require('./config'),
    galactus = require('./routes/galactus.js'),
    express = require('express'),
    //https = require('https'),
    http = require('http'),
    ejs = require('ejs'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    multer = require('multer'),
    logger = require('morgan'),
    compression = require('compression'),
    session = require('express-session'),
    csurf = require('csurf'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    directory = require('serve-index'),
    errorHandler = require('errorhandler'),
    basicAuth = require('basic-auth-connect');  // optional, for HTTP auth

/*var options = {
    key: fs.readFileSync('key.pem'), // RSA private-key
    cert: fs.readFileSync('cert.pem') // RSA public-key certificate
};*/

// Middlewares

function isAuthenticated (req, res, next) {
    if (!(req.session && req.session.auth)) {
        res.status(500).send('You need to be signed in order to use this feature');
    } else {
        next();
    }
}

// create Express app server
var app = express();  

// Configure app server

// use PORT environment variable, or local config file value
app.set('port', process.env.PORT || 8000);

// change param value to control level of logging
app.use(logger('dev'));

// use compression (gzip) to reduce size of HTTP responses
app.use(compression());

// parse HTTP request body
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

// set file-upload directory for poster images
var upload = multer({ dest: __dirname + '/public/img/uploads/' });

// set session
app.use(session({
    name: config.session.name,
    secret: config.session.secret,
    rolling: true,  // reset session timer on every client access
    cookie: { 
        maxAge: config.session.timeout,
        // maxAge: null,  // no-expire session-cookies for testing
        httpOnly: true,
        secure: true
    },
    saveUninitialized: false,
    resave: false
}));

// set CSRF protection 
//app.use(csurf());

// checks req.body for HTTP method overrides
app.use(methodOverride());

// add HSTS header to all responses
app.use(function (req, res, next) {
    res.header('Strict-Transport-Security', 'max-age=31536000');
    next();
});

// Setup for rendering csurf token into index.html at app-startup
app.engine('.html', ejs.__express);
app.set('views', __dirname + '/public');

// App routes (RESTful API) - handler implementation resides in routes/galactus.js

// Perform route lookup based on HTTP method and URL.
// Explicit routes go before express.static so that proper
// handler is invoked rather than static-content processor

app.get('/', galactus.api);
//app.get('/test/test.html', galactus.index);
//app.get('/index.html', galactus.index);
app.get('/movies', galactus.getMovies);
app.get('/movies/:id', galactus.getMovie);
app.post('/movies', [isAuthenticated, upload.single('file')], galactus.addMovie);
app.put('/movies/:id', [isAuthenticated, upload.single('file')], galactus.editMovie);
app.delete('/movies/:id', isAuthenticated, galactus.deleteMovie);
app.get('/movies/:id/reviews', galactus.getReviews);
app.post('/movies/:id/reviews', isAuthenticated, galactus.addReview);
app.get('/movies/:id/video', galactus.playMovie);
app.post('/auth', galactus.signUp);
app.put('/auth', galactus.signIn);

// location of app's static content
app.use(express.static(__dirname + '/public'));
app.use(directory(__dirname +  '/public/docs'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));

// Default-route middleware, in case none of above match
app.use(function (req, res) {
    return res.status(404).send('<h3>Oops. Something went wrong.</h3>');
});

// Error middleware
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        res.status(403).send('<h3>Oops. Please reload the app.</h3>');
    } else {
        return next(err);
    }
});

// Start HTTP server
/*https.createServer(options, app).listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', app.get('port'), config.env);
});*/
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port %d in %s mode', app.get('port'), config.env);
});