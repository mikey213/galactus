/*jslint node: true*/

'use strict';

var config = require(__dirname + '/../config'),
    express = require('express'),
    mongoose = require('mongoose'),
    bcrypt = require('bcryptjs'),
    url = require('url'),
    fs = require('fs'),
    _ = require('underscore');

// Constants
var PUBLIC_DIR = __dirname + '/../public/', 
    UPLOADS_PATH = 'img/uploads/',
    VIDEO_PATH = 'img/videos/',
    DATA_URI_REGEX = /^data:image\/(.*);base64,(.*)$/;

// Connect to database, using credentials specified in your config module
mongoose.connect(config.db.uri());

// Schemas
var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    email: { type: String, required: true }
});
var MovieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    released: { type: Number, required: true },
    director: { type: String, required: true },
    starring: { type: [String], required: true },
    rating: { type: String, required: true },
    duration: { type: Number, required: true },
    genre: { type: [String], required: true },
    synopsis: { type: String, required: true },
    freshTotal: { type: Number, required: true },
    freshVotes: { type: Number, required: true },
    trailer: { type: String },
    poster: { type: String, required: true },
    dated: { type: Date, required: true }, 
    userId: { type: String, required: true, ref: 'User' }
});
var ReviewSchema = new mongoose.Schema({
    freshness: { type: Number, required: true },
    reviewText: { type: String, required: true },
    reviewName: { type: String, required: true },
    reviewAffil: { type: String, required: true },
    movieId: { type: String, required: true, ref: 'Movie' }
});

// Constraints
MovieSchema.index({ title: 1, director: 1 }, { unique: true });
ReviewSchema.index({ reviewName: 1, reviewAffil: 1, movieId: 1 }, { unique: true, dropDups: true });

// Models
var User = mongoose.model('User', UserSchema);
var Movie = mongoose.model('Movie', MovieSchema);
var Review = mongoose.model('Review', ReviewSchema);

// Upload base64-encoded image
/*
 * @param {[Object]} movie: movie of image to upload
 * @param {[Function]} callback: function to call after operation finishes
 */
var uploadImage = function (movie, callback) {
    // check if poster is a base64-encoded string
    if (DATA_URI_REGEX.test(movie.poster)) {
        var data = movie.poster.match(DATA_URI_REGEX);
            url = UPLOADS_PATH + movie._id + '.' + data[1];
        // upload image
        fs.writeFile(PUBLIC_DIR + url, data[2], 'base64', function (err) {
            if (err) {
                return callback(err, movie);
            }
            movie.poster = url;
            movie.save(callback);
        });
    } else {
        callback(null);
    }
};

// Implemention of galactus API handlers:

// Heartbeat response for server API
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.api = function (req, res) {
    res.status(200).send('<h3>There was a heartbeat!</h3>');
};
// Retrieve index page
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
/*exports.index = function (req, res) {
    res.render(req.originalUrl.slice(1).split(/[?#]/)[0], { 'token': req.csrfToken() });
};*/
// Retrieve many movie models
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.getMovies = function (req, res) {
    Movie.find(function (err, movies) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve any movies at this time (" + err.message + ")");
        } else {
            res.status(200).send(movies);
        }
    });
};
// Retrieve an individual movie model, using it's id as a DB key
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.getMovie = function (req, res) {
    Movie.findById(req.params.id, function (err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" + err.message + ")");
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            res.status(200).send(movie);
        }
    });
};
// Add movie model
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.addMovie = function (req, res) {
    var movie = new Movie(_.extend(req.body, { userId: req.session.userId }));
    movie.save(function (err) {
        if (!err) {
            uploadImage(movie, function (err) {
                if (err) {
                    res.status(500).send("Sorry, unable to upload image at this time (" + err.message + ")");
                } else {
                    res.status(200).send(movie); 
                }
            });
        } else if (err.code === 11000) {
            res.status(403).send("Sorry, a movie with the same title and director has already been added");
        } else {
            res.status(500).send("Sorry, unable to save movie at this time (" + err.message + ")"); 
        }
    });
};
// Update movie model
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.editMovie = function (req, res) {
    Movie.findById(req.params.id, function (err, movie) {  
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" + err.message + ")");
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else if (req.session.userId !== movie.userId) {
            res.status(500).send("You do not have permission to modify this record");
        } else {
            _.extend(movie, req.body).save(function (err) {
                if (!err) {
                    uploadImage(movie, function (err) {
                        if (err) {
                            res.status(500).send("Sorry, unable to upload image at this time (" + err.message + ")");
                        } else {
                            res.status(200).send(movie); 
                        }
                    });
                } else if (err.code === 11000) {
                    res.status(403).send("Sorry, a movie with the same title and director has already been added");
                } else {
                    res.status(500).send("Sorry, unable to save movie at this time (" + err.message + ")");
                }
            });
        }
    });
};
// Delete movie model
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.deleteMovie = function (req, res) {
    Movie.findById(req.params.id, function (err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" + err.message + ")");
        } else if (!movie) {
            res.status(404).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else if (req.session.userId !== movie.userId) {
            res.status(500).send("You do not have permission to modify this record");
        } else {
            movie.remove(function (err) {
                if (err) {
                    res.status(500).send("Sorry, unable to delete movie at this time (" + err.message + ")");
                    return;
                }
                if (movie.poster.indexOf(UPLOADS_PATH) === 0) {
                    fs.unlink(PUBLIC_DIR + movie.poster, function (err) {
                        if (err) {
                            console.log("Error trying to unlink image: " + err.message);
                        }
                    });
                }
                Review.remove({ movieId: req.params.id }, function (err) {
                    if (err) {
                        console.log("Error trying to delete reviews: " + err.message);
                    }
                });
                res.status(200).send({ 'responseText': 'The movie has successfully deleted' }); 
            });
        }   
    });
};
// Retrieve review models
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.getReviews = function (req, res) {
    Review.find({ movieId: req.params.id }, function (err, reviews) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve reviews at this time (" + err.message + ")");
        } else {
            res.status(200).send(reviews);
        }
    });
};
// Add review model
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.addReview = function (req, res) {
    var review = new Review(req.body);
    Movie.findById(req.params.id, function (err, movie) {
        if (err) {
            res.status(500).send("Sorry, unable to retrieve movie at this time (" + err.message + ")");
        } else if (!movie) {
            res.status(500).send("Sorry, that movie doesn't exist; try reselecting from Browse view");
        } else {
            // add review
            review.save(function (err) {
                if (!err) {
                    // update associated movie
                    movie.freshVotes += review.freshness;
                    movie.freshTotal += 1;
                    movie.save(function (err) {         
                        if (err) {
                            res.status(500).send("Sorry, unable to save movie at this time (" + err.message + ")");
                        } else {
                            res.status(200).send(review);
                        }
                    });
                } else if (err.code === 11000) {
                    res.status(403).send("Sorry, you have already made a review");
                } else {
                    res.status(500).send("Sorry, unable to add review at this time (" + err.message + ")");
                }
            });
        }
    });
};
// Stream video
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.playMovie = function (req, res) {
    // compute absolute file-system video path from __dirname and URL with id
    var file = PUBLIC_DIR + VIDEO_PATH + req.params.id + '.mp4';
    // get HTTP request "range" header, and parse i to get starting byte position
    var range = req.headers.range.replace(/bytes=/, '').split('-');
    var start = parseInt(range[0], 10);
    // get a file-stats object for the requested video file, including its size
    fs.stat(file, function (err, stats) {
        if (err) {
            res.status(404).send("Sorry, unable to play video at this time");
        } else {
            // set end position from range header or default to video file size
            var end = range[1] ? parseInt(range[1], 10) : stats.size - 1;
            // set chunksize to be the difference between end and start values +1
            var chunksize = end - start + 1;
            // send HTTP "partial-content" status (206) together with
            // HTML5-compatible response-headers describing video being sent
            res.writeHead(206, {
                'Content-Range': 'bytes ' + start + '-' + end + '/' + stats.size, 
                'Content-Length': chunksize,
                'Accept-Ranges': 'bytes',
                'Content-Type': 'video/mp4'
            });
            // create ReadStream object, specifying start, end values computed
            // above to read range of bytes rather than entire file
            var rs = fs.createReadStream(file, { start: start, end: end });
            // when ReadStream is open
            rs.on('open', function() {
                // use stream pipe() method to send the HTTP response object,
                // with flow automatically managed so destination is not overwhelmed
                rs.pipe(res);   
            // when error receiving data from stream, send error back to client.
            // stream is auto closed
            }).on('error', function(err) {
                res.end(err);
            });
        }
    });
};
// Sign up user
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.signUp = function (req, res) {
    var user = new User(req.body);
    // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
        // hash password w/ salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            // store the hashed-w/-salt password in the DB
            user.password = hash;
            user.save(function (err, rslt) {
                if (!err) {
                    _.extend(req.session, { auth: true, username: rslt.username, userId: rslt.id });
                    res.status(200).send({ 'userId': rslt.id, 'username': rslt.username }); 
                } else if (err.code === 11000) {
                    res.status(403).send("Sorry, username is already taken; please choose another username");
                } else {
                    res.status(500).send("Unable to create account at this time; please try again later (" + err.message + ")");
                }
            });
        });
    });
};
// Sign in user
/*
 * @param {[Object]} req: request
 * @param {[Object]} res: response
 */
exports.signIn = function (req, res) {
    if (req.body.login) {
        var username = req.body.username,
            password = req.body.password;

        User.findOne({ username: username }, function(err, user) {
            if (err) {
                res.status(500).send("Unable to login at this time; please try again later");
            } else if (!user) {
                res.status(403).send("That username does not exist; please try again");
            } else {
                bcrypt.compare(password, user.password, function (err, rslt) {
                    if (err) {
                        res.status(500).send("Unable to login at this time; please try again later");
                    } else if (!rslt) {
                        res.status(403).send("The username and password you entered does not match; please try again");
                    } else {
                        _.extend(req.session, { 
                            auth: true, 
                            username: user.username, 
                            userId: user.id, 
                            cookie: {
                                maxAge: req.body.remember ? 10 * config.session.timeout : config.session.timeout  
                            }
                        });
                        res.status(200).send({ 'userId': user.id, 'username': username });
                    }
                });
            }
        });
    } else {
        //req.session.destroy(); // destroy session in the session-store
        req.session.auth = false;
        res.status(200).send({ 'userId': undefined, 'username': undefined });
    }
};
