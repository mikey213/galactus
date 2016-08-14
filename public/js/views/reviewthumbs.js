/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.ReviewThumbs = Backbone.View.extend({
    reviewsTemplate: _.template(
        "<% reviews.each(function(review) { %>" +
            "<%= reviewTemplate(review.toJSON()) %>" +
        "<% }); %>"
    ),
    // Initialize the view
    initialize: function () {
        this.$loadingThumb = $.get('tpl/ReviewThumb.html');
    },
    // Render the view
    render: function () {
        var self = this;
    	this.$loadingThumb.done(function (data) {
            self.$el.html(self.reviewsTemplate({ 
                reviews: self.collection, 
                reviewTemplate: _.template(data) 
            }));
    	});
        return this;
    }
});
