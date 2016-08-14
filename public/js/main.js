/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.AppRouter = Backbone.Router.extend({
    // Map "URL paths" to "router functions"
    routes: {
        '': 'home',
        'about': 'about',
        'movies': 'movies',
        'movies/add': 'addMovie',
        'movies/:id': 'editMovie',
        'movies/:id/reviews': 'reviews',
        '*path': 'home'
    },
    // Initialize router
    initialize: function () {
        this.headerView = new galactus.Header({ model: new galactus.User() });
        $('.header').html(this.headerView.render().el);
    },
    // Show Home view
    home: function () {
        if (!this.homeView) {
            this.homeView = new galactus.Home();
        }
        $('#content').html(this.homeView.render().el);
    },
    // Show About view
    about: function () {
        if (!this.aboutView) {
            this.aboutView = new galactus.About();
        }
        $('#content').html(this.aboutView.render().el);
    },
    // Show Browse view
    movies: function () {
        var movies = new galactus.Movies();
        movies.fetch({
            error: function (xhr) {
                galactus.utils.showNotice('danger', xhr.responseText);
            },
            success: function () {
                var moviesView = new galactus.MoviesView({ collection: movies });
                $('#content').html(moviesView.render().el);  	    
            }
        });
    },
    // Show Detail view for adding a movie
    addMovie: function () {
        var detailsView = new galactus.Details({ model: new galactus.Movie() });
        $('#content').html(detailsView.render().el);
    },
    // Show Detail view for editing a movie
    /*
     * @param {[Integer]} id: ID of movie to edit
     */
    editMovie: function (id) {
        var movie = new galactus.Movie({ _id: id });

        movie.fetch({
            error: function (xhr) {
                galactus.utils.showNotice('danger', xhr.responseText);
            },
            success: function () {
                var detailsView = new galactus.Details({ model: movie });
                $('#content').html(detailsView.render().el);
            }
        });
    },
    // Show Reviews view for a movie
    /*
     * @param {[Integer]} id: ID of movie to review
     */
    reviews: function (id) {
        var movie = new galactus.Movie({ _id: id });

        movie.fetch({
            error: function (xhr) {
                galactus.utils.showNotice('danger', xhr.responseText);
            },
            success: function () {
                var reviews = movie.reviews;
                reviews.fetch({
                    error: function (xhr) {
                        galactus.utils.showNotice('danger', xhr.responseText);
                    },
                    success: function () {
                        var reviewsView = new galactus.ReviewsView({ model: movie });
                        $('#content').html(reviewsView.render().el);
                    }
                });
            }
        });
    } 
});
// Load HTML templates for Home, Header, About views, and when
// template loading is complete, instantiate a Backbone router
// with history.
galactus.utils.loadTemplates([
    'Home', 'Header', 'About', 'Details', 'MovieForm', 'MovieImg',
    'ReviewsView', 'Reviewer', 'SignIn', 'SignUp'
], function() {
    galactus.app = new galactus.AppRouter();
    Backbone.history.start();
    Backbone.ajax = function() {
        // Invoke $.ajaxSetup in the context of Backbone.$
        /*Backbone.$.ajaxSetup.call(Backbone.$, {
            beforeSend: function (jqXHR) {
                jqXHR.setRequestHeader('X-CSRF-Token', galactus.token);
            }
        });*/
        return Backbone.$.ajax.apply(Backbone.$, arguments);
    };
});
