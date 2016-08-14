QUnit.jUnitReport = function (report) {
    console.log(report.xml);   // send XML outPUT report to console
};

var movie, review;

QUnit.module(null, {
    // setup before each test
    beforeEach: function (assert) {
        var done = assert.async(),
            d = new Date();
        // authenticate user with valid credentials
        var user = new galactus.User({ username: 'a', password: 'a', login: true });
        user.save(null, {
            type: 'PUT',
            success: function (model, res) {
                assert.equal(res.username, 'a', 'Successful login with valid credentials');
                // create a unique movie
                movie = new galactus.Movie({
                    '__v': 0, 'dated': d.toISOString(), 'director': 'Test Director', 'duration': 123, 
                    'freshTotal': 1, 'freshVotes': 1, 'genre': [ 'action' ], 'poster':'img/placeholder.png', 
                    'rating': 'G', 'released': 2015, 'starring': [ 'Test Actor' ], 
                    'synopsis': 'Test movie', 'title': 'Movie ' + d.getTime(), 'trailer': '', 'userId': res.userId
                });
                movie.urlRoot = '/movies';
                // create a unique review
                review = new galactus.Review({
                    '__v': 0, 'dated': d.toISOString(), 'reviewAffil': 'Test Affil', 
                    'reviewName': 'Reviewer ' + d.getTime(), 'reviewText': 'Test review'
                });
                done();
            }
        });
    }
});

QUnit.test('Test saving a movie with missing attributes fails', function (assert) {
    assert.expect(2);
    var done = assert.async();

    var movie = new galactus.Movie({ 'title': 'Bad movie' });
        movie.urlRoot = '/movies';
    // try to save a movie
    movie.save(null, {
        error: function (model, err) {
            assert.equal(err.status, 500, 'Saving movie returns 500 status');
            done();
        }
    });
});

QUnit.test('Test saving the same movie twice fails', function (assert) {
    assert.expect(3);
    var done = assert.async(2);
    // try to save a movie
    movie.save(null, {
        success: function (model, res) {
            assert.ok(true, 'Saving movie succeeded');
            done();
            // clear ID to treat movie as new
            movie.unset('_id');
            // try to save the same movie again!
            movie.save(null, {
                error: function (model, err) {
                    assert.equal(err.status, 403, 'Saving same movie returns 403 status');
                    done();
                }
            });
        }
    });
});

QUnit.test('Test deleting non-existant movie fails', function (assert) {
    assert.expect(2);
    var done = assert.async();

    movie.set('_id', '557761f092e40db92c3ccdae');
    // try to destroy a non-existant movie
    movie.destroy({
        error: function (model, err) {
            assert.equal(err.status, 404, 'Deleting non-existant movie returns 404 status code');
            done();
        }
    });
});

QUnit.test('Test deleting the same movie twice fails', function (assert) {
    assert.expect(4);
    var done = assert.async(3);
    var $dfd = [ $.Deferred(), $.Deferred() ];
    // save movie first
    movie.save(null, {
        success: function (model, res) {
            assert.ok(true, 'Saving movie returns 200 status code');
            done();
            $dfd[0].resolve();
        }
    });
    // try to destroy a movie
    $dfd[0].done(function () {
        movie.destroy({
            success: function (model, res) {
                assert.ok(true, 'Deleting movie returns 200 status code');
                done();
                $dfd[1].resolve();                
            }
        });
    });
    // try to destroy the same movie again!
    $dfd[1].done(function () {
        movie.destroy({
            error: function (model, err) {
                assert.equal(err.status, 404, 'Deleting movie twice returns 404 status code');
                done();
            }
        });
    });
});

QUnit.test('Test related reviews are deleted after deleting a movie', function (assert) {
    assert.expect(5);
    var done = assert.async(4);
    var $dfd = [ $.Deferred(), $.Deferred(), $.Deferred() ];
    // try to save movie
    movie.save(null, {
        success: function (model, res) {
            assert.ok(true, 'Saving movie returns 200 status code');
            done();
            $dfd[0].resolve();
        }
    });
    // try to save review
    $dfd[0].done(function () {
        review.set('movieId', movie.get('_id'));
        movie.reviews.url = '/movies/' + movie.get('_id') + '/reviews';
        movie.reviews.create(review, {
            success: function (model, res) {
                assert.ok(true, 'Saving review returns 200 status code');
                done();
                $dfd[1].resolve();
            }
        });
    });
    // try to destroy a movie
    $dfd[1].done(function () {
        movie.destroy({
            success: function (model, res) {
                assert.ok(true, 'Deleting movie returns 200 status code');
                done();
                $dfd[2].resolve();
            }
        });
    });
    // check that there are no reviews
    $dfd[2].done(function () {
        movie.reviews.fetch({
            success: function (coll, res) {
                assert.equal(coll.length, 0, 'Deleting movie deletes all associated reviews');
                done();
            }
        });
    });
});