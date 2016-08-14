/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus = galactus || {};

galactus.User = Backbone.Model.extend({
	urlRoot: '/auth',
    idAttribute: '_id',
    // Validate all or selected model attributes
    // received before setting them. 
    /*
     * @param {[Mixed]} keys: attribute names to check (optional)
     * @return {[Boolean]} whether the attribute has any errors or not
     */
    validateAll: function (keys) {
        this.errors = {};

        var validation = _.isUndefined(keys) ? this.validation : _.pick(this.validation, keys);
        // iterate over selected keys in model validation
        _.each(validation, function (rules, key) {
            var val = this.attributes[key];
            // iterate over all the rules associated with key
            _.each(rules, function (rule) {
                // check rule
                if (!val && rule.required) {
                    this.errors[key] = rule.message;
                } else if (val && rule.pattern && !rule.pattern.test(val)) {
                    this.errors[key] = rule.message;
                } else if (rule.equalTo && this.attributes[rule.equalTo] !== val) {
                    this.errors[key] = rule.message;
                }
            }, this);
        }, this);
    
        return _.isEmpty(this.errors);
    },
    // Set default values
	defaults: {
        username: '',
        password: '',
        email: ''
    },
    // Set validation rules
    validation: {
        username: [{ 
            required: true,
            message: "You must enter a username"
        }],
        password: [{ 
            required: true,
            message: "You must enter a password"
        }],
        password2: [{ 
            required: true,
            message: "You must enter a password"
        }, {
            equalTo: "password",
            message: "This does not match password entered"
        }],
        email: [{
            required: true,
            message: "You must enter an email"
        }] 
    }
});
