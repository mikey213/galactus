/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus = galactus || {};

galactus.utils = {
    // Asynchronously load templates located in separate .html files using
    // jQuery "deferred" mechanism, an implementation of Promises.  Note we
    // depend on template file names matching corresponding View file names,
    // e.g. Home.html and home.js which defines Backbone View "Home".
    /*
     * @param {[String]} views:  filenames of templates to be loaded
     * @param {function} callback:  callback function invoked when file is loaded
     */
    loadTemplates: function(views, callback) {
        // Array of deferred actions to keep track of template load status
        var deferreds = [];
        // Process each template-file in views array
        /*
         * @param {[integer]} index:  position of view template within views array
         * @param {[String]} view:  root name (w/o .html) of view template file
         */
        $.each(views, function(index, view) {
            // If an associated Backbone view is defined, set its template function
            if (galactus[view]) {
                // Push task of retrieving template file into deferred array.
                // Task performs "get" request to load the template, then passes
                // resulting template data to anonymous function to process it.
                /*
                 * @param {String} data:  HTML from template file as String
                 */
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
	    	    // Set template function on associated Backbone view.
                    galactus[view].prototype.template = _.template(data);
                }));
            // No Backbone view file is defined; cannot set template function.
            } else {
                console.log(view + ' not found');
            }
        });
        // When all deferred template-loads have completed,
        // invoke callback function.
        $.when.apply(null, deferreds).done(callback);
    },
    // Show form errors.
    /*
     * @param {[Object]} errors: key-value pair of IDs/errors
     * @param {[Object]} context: 
     */ 
    showErrors: function (errors, context) {
        $.each(errors, function(key, message) {
            var $input = $('[name=' + key + ']', context);
            $input.closest('.form-group').addClass('has-error');
            $input.next('.help-error').remove();
            $input.after('<span class="help-error">' + message + '</span>');
        });
    },
    // Hide all form errors.
    hideErrors: function () {
        var $formGroups;
        if (arguments.length == 2) {
            $formGroups = $('[name=' + arguments[0] + ']', arguments[1]).closest('.form-group');
        } else {
            $formGroups = $('.form-group.has-error', arguments[0]);
        }
        $formGroups.each(function () {
            $(this).removeClass('has-error');
            $('.help-error', this).remove();
        });
    },
    // Show notification.
    /* 
     * @param {[String]} alertType: type of alert e.g. success, info, danger
     * @param {[String]} message: message to appear
     */
    showNotice: function (alertType, message) {
        var self = this;
        // keep only one instance
        if (!this.$alert) {
            this.$alert = $('<div/>', { 'role': 'alert', 'style': 'display: none' });
        }
        // set its type and message, and add it to DOM
        this.$alert.attr('class', 'alert alert-' + alertType);
        this.$alert.html('<span>' + message + '</span>');
        this.$alert.prependTo('#content');
        // show it for 5 seconds, and then hide it 
        this.$alert.fadeIn(function () {
            setTimeout(function () { self.hideNotice() }, 5000);
        });
    },
    // Hide notification.
    hideNotice: function () {
        if (this.$alert) {
            this.$alert.fadeOut();
        }
    }
};

// Convert text to title case.
// e.g. peter parker, mary-jane -> Peter Parker, Mary-Jane
/*
 * @param {[String]} str: text to convert
 * @return {[String]} value of a string converted to title case
 */
String.prototype.toTitleCase = function () { 
    return this.replace(/[a-z]*[^a-z]*/gi, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
