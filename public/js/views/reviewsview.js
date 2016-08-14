/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.ReviewsView = Backbone.View.extend({
    id: 'reviews',
    // Initialize the view
    initialize: function () {
        // ugly: re-render view with updated model, if changes are made to reviews
        var self = this;
        this.listenTo(this.model.reviews, 'sync', function () {
            self.model.fetch({ success: self.render.bind(self) });
        });
        this.reviewerView = new galactus.Reviewer({ model: this.model });
        this.reviewThumbsView = new galactus.ReviewThumbs({ collection: this.model.reviews });
    },
    // Render the view
    render: function (movie) {
        this.$el.html(this.template());
        this.reviewerView.setElement(this.$('#form')).render();
        this.reviewThumbsView.setElement(this.$('#thumbnails')).render();
        return this;
    }
});
