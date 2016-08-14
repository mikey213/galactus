/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.Reviews = Backbone.Collection.extend({
    model: galactus.Review
});
