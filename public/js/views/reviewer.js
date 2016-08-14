/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.Reviewer = Backbone.View.extend({
    // Render the view
    render: function () {
        this.$el.html(this.template(this.model.toJSONC()));
        return this;
    },
    // Bind events
    events: {
        'click #review': 'review'
    },
    // Save review
    /*
     * @param {[Object]} e: information about the event
     */
    review: function (e) {
        e.preventDefault();
      
        var review = new galactus.Review({
            freshness: this.$('[name=freshness]:checked').val(),
            reviewText: _.escape(this.$('[name=reviewText]').val().trim()),
            reviewName: _.escape(this.$('[name=reviewName]').val().trim()),
            reviewAffil: _.escape(this.$('[name=reviewAffil]').val().trim()),
            movieId: this.model.get('_id')
        });
        // save review
        this.model.reviews.create(review, { 
            wait: true,
            error: function (model, error) {
                galactus.utils.showNotice('danger', error.responseText);
            }
        });
    }
});
