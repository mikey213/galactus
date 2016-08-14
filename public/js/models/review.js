/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus = galactus || {};

galactus.Review = Backbone.Model.extend({
	idAttribute: '_id',
    // Set default values
    defaults: {
        freshness: 0.0,
        reviewName: '',
        reviewText: '',
        movieId: ''
    }
});
