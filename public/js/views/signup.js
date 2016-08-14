/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.SignUp = Backbone.View.extend({
    // Render the view
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    // Bind events
    events: {
        'change input': 'change',
        'click #sign-up': 'signUp'
    },
    // Set/validate user attribute
    /*
     * @param {[Object]} e: information about the fired event
     */
    change: function (e) {
        e.preventDefault();
        var input = e.target;
        galactus.utils.hideErrors(input.name, this.el);
        this.model.setOne(input.name, _.escape(input.value));
        // validate input
        if (!this.model.validateAll(input.name)) {
            galactus.utils.showErrors(this.model.errors, this.el);
        }
    },
    // Create a new user
    /*
     * @param {[Object]} e: information about the fired event
     */
    signUp: function (e) {
        e.preventDefault();
        galactus.utils.hideErrors(this.el);
        // validate inputs
        if (this.model.validateAll()) {  
            this.model.save(null, {
                wait: true,
                success: function (model, res) {
                    galactus.userId = res.userId;
                    galactus.username = res.username;
                    galactus.utils.showNotice('success', 'Welcome <strong>' + galactus.username + '</strong>! You have successfully signed up.');
                    Backbone.trigger('authenticating', res);
                },
                error: function (model, err) {
                    galactus.utils.showNotice('danger', err.responseText); 
                }
            });
        } else {
            galactus.utils.showErrors(this.model.errors, this.el);
        }
    }
});
