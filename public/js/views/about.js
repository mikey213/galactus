/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.About = Backbone.View.extend({
    id: 'about',
    // Render the view
    render: function () {
       this.$el.html(this.template());
       return this;
    }
});
