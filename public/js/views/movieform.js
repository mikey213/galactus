/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.MovieForm = Backbone.View.extend({
    // Render the view
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    // Bind events
    events: {
        'change :input': 'change'
    },
    // Set/validate model attribute
    /*
     * @param {[Object]} e: information about the fired event
     */
    change: function (e) {
        var input = e.target;
        galactus.utils.hideErrors(input.name, this.el);
        this.model.setOne(input.name, _.escape($(input).val().trim()));
        // validate input
        if (this.model.validateAll(input.name)) {
            galactus.utils.showNotice('info', 
                '<strong>Note!</strong> Movie attribute updated; to make changes permanent, click "Save Changes" button');
        } else {
            galactus.utils.showNotice('danger', '<strong>Error!</strong> Fix validation errors and try again');
            galactus.utils.showErrors(this.model.errors);
        }
    }
});
