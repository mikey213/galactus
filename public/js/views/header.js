/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.Header = Backbone.View.extend({
    // Initialize the view
    initialize: function () {
        this.signInView = new galactus.SignIn({ model: this.model });
        this.signUpView = new galactus.SignUp({ model: this.model });      

        this.listenTo(Backbone, 'authenticating', this.authenticateUI);
        this.listenTo(Backbone, 'deauthenticating', this.deauthenticateUI);
    },
    // Render the view
    render: function () {
        this.$el.html(this.template());
        this.signInView.setElement(this.$('.sign-in > .dropdown-menu')).render();
        this.signUpView.setElement(this.$('.sign-up > .dropdown-menu')).render();
        return this;
    },
    // Bind events
    events: {
        'click a': 'selectMenuItem',
        'mouseenter .nav > li': 'openDropdown',
        'mouseleave .nav > li': 'closeDropdown',
        'change input[type=radio]': 'sortMovies'
    },
    // Set menu item in active state
    // Note: this implementation of selectMenuItem was confirmed with prof as acceptable
    /*
     * @param {[Object]} e: information about the fired event
     */
    selectMenuItem: function (e) {
    	// Unset the active state of any selected menu item
        this.$('.active').removeClass('active');
        // Set the active state of selected menu item
        $(e.target).parent().addClass('active');
        // Extra: Uncollapse dropdown menu on mobile screens
        this.$('.navbar-collapse.in').collapse('hide');
    },
    // Sort movies on the Browse view
    /*
     * @param {[Object]} e: information about the fired event
     */
    sortMovies: function (e) {
        Backbone.trigger('ordering', e);
        this.closeDropdown();
    },
    // Show dropdown menu
    /*
     * @param {[Object]} e: information about the fired event
     */
    openDropdown: function (e) {
        $(e.target).closest('li').addClass('open');
    },
    // Hide dropdown menu
    closeDropdown: function () {
        this.$('li.open').removeClass('open');
    },
    // Update UI on sign-in
    /*
     * @param {[Object]} res: response object
     */
    authenticateUI: function (res) {
        this.closeDropdown();
        this.$('li.sign-in .username').text(res.username);
        this.$('li.sign-up').addClass('hidden').find('form').trigger('reset');
        this.$('li.sign-in').find('form').addClass('hidden').trigger('reset');
        this.$('li.sign-in').find('.sign-out').removeClass('hidden');
        this.$('li.add-movie').removeClass('hidden');
    },
    // Update UI on sign-out
    deauthenticateUI: function () {
        this.$('li.sign-in .username').empty().first().text('Sign In');
        this.$('li.sign-up').removeClass('hidden');
        this.$('li.sign-in').find('form').removeClass('hidden');
        this.$('li.sign-in').find('.sign-out').addClass('hidden');
        this.$('li.add-movie').addClass('hidden');
    }
});
