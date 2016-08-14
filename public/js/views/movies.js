/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.MoviesView = Backbone.View.extend({
    id: 'browse',
    moviesTemplate: _.template(
        "<% movies.each(function(movie) { %>" +
            "<%= movieTemplate(movie.toJSONC()) %>" +
        "<% }); %>"
    ),
    // Initialize the view
    initialize: function () {
        this.$loadingThumb = $.get('tpl/MovieThumb.html');
        this.listenTo(Backbone, 'ordering', this.render);
    },
    // Render the view
    render: function (e) {
        var self = this;
        this.$loadingThumb.done(function (data) {
            if (e) {
                self.collection.sortByAttribute(e.target.value);
            }
            self.$el.html(self.moviesTemplate({
                movies: self.collection, 
                movieTemplate: _.template(data) 
            }));
        });
        return this;
    }
});
