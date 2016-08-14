/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.Movies = Backbone.Collection.extend({
    url: '/movies',
    model: galactus.Movie,
    // Initialize collection
    initialize: function () {
        this.sortKey = 'title';
    },
    // Define how to compare each model
    /*
     * @param {[Object]} model: model to compare
     */
    comparator: function (model) {
        return model.get(this.sortKey);
    },
    // Sort collection by attribute
    /*
     * @param {[String]} key: attribute to sort collection on
     */
    sortByAttribute: function (key) {
        this.sortKey = key;
        this.sort();
    }
});
