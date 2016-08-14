/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.Home = Backbone.View.extend({
    id: 'home',
    // Render the view
    render: function () {
        this.$el.html(this.template());
        return this;
    }
});
