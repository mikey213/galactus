/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.SignIn = Backbone.View.extend({
    // Render the view
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    // Bind events
    events: {
        'change input': 'change',
        'mousedown #sign-in': 'signIn',
        'mousedown #sign-out': 'signOut'
    },
    // Set/validate user attribute
    /*
     * @param {[Object]} e: information about the fired event
     */
    change: function (e) {
        var input = e.target;
        galactus.utils.hideErrors(input.name, this.el);
        this.model.set(input.name, _.escape(input.value));
        // validate input
        if (!this.model.validateAll(input.name)) {
            galactus.utils.showErrors(this.model.errors, this.el);
        }
    },
    // Authenticate user
    /*
     * @param {[Object]} e: information about the fired event
     */
    signIn: function (e) {
        if (e.which === 1) {
            galactus.utils.hideErrors(this.el);
            // validate inputs
            if (this.model.validateAll(['username', 'password'])) {
                this.model.save({ login: true }, {
                    type: 'PUT',
                    wait: true,
                    error: function (model, err) {
                        galactus.utils.showNotice('danger', err.responseText);
                    },
                    success: function (model, res) {
                        galactus.userId = res.userId;
                        galactus.username = res.username;
                        galactus.utils.showNotice('success', 'Welcome back <strong>' + galactus.username + '</strong>!');
                        Backbone.trigger('authenticating', res);
                    }
                });
            } else {
                galactus.utils.showErrors(this.model.errors, this.el);
            }
        }
    },
    //
    /*
     * @param {[Object]} e: information about the fired event
     */
    signOut: function (e) {
        if (e.which === 1) {
            this.model.clear().set(this.model.defaults);
            this.model.save({ login: false }, {
                type: 'PUT',
                wait: true,
                error: function (model, err) {
                    galactus.utils.showNotice('danger', err.responseText);
                },
                success: function (model, res) {    
                    galactus.token = res.token;
                    galactus.utils.showNotice('success', '<strong>Goodbye!</strong> Please come back soon.');
                    Backbone.trigger('deauthenticating');
                }
            });
        }
    }
});
