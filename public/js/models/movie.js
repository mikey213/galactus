/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus = galactus || {};

galactus.Movie = Backbone.Model.extend({
    urlRoot: '/movies',
    idAttribute: '_id',
    // Initialize the model
    initialize: function () {
        this.reviews = new galactus.Reviews();
        this.reviews.url = '/movies/' + this.id + '/reviews';
    },
    // Validate all or selected model attributes
    // received before setting them. 
    /*
     * @param {[Mixed]} keys: attributes names to check (optional)
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
                } else if (rule.equalTo && rule.equalTo !== val) {
                    this.errors[key] = rule.message;
                }
            }, this);
        }, this);

        return _.isEmpty(this.errors);
    },
    // Set model attribute
    /*
     * @param {[String]} key: attribute name
     * @param {[String]} val: attribute value
     */
    setOne: function (key, val) {
        if (key === 'director') {
            this.attributes[key] = val.toTitleCase();
        } else if (key === 'starring') {
            this.attributes[key] = val.toTitleCase().split(',').map($.trim);
        } else if (key === 'rating') {
            this.attributes[key] = val.toUpperCase();
        } else if (key === 'genre') {
            this.attributes[key] = val.toLowerCase().split(',').map($.trim);
        } else if (key === 'released' || key === 'duration') {
            this.attributes[key] = parseInt(val, 10);
        } else {
            this.attributes[key] = val;
        }
    },
    // Get overall freshness
    getFreshness: function () {
        return this.get('freshVotes') / this.get('freshTotal') * 100;
    },
    // Get a shallow copy of model static + computed attributes  
    toJSONC: function () {
        return _.extend({}, this.toJSON(), { freshness: this.getFreshness() });
    },
    // Set default values
    defaults: {
        title: '',
        released: null,
        director: '',
        starring: [],
        rating: '',
        duration: null,
        genre: [],
        synopsis: '',
        freshTotal: 0.0,
        freshVotes: 0.0,
        trailer: null,
        poster: 'img/placeholder.png',
        dated: new Date()
    },
    // Set validation rules
    validation: {
        title: [{ 
            required: true,
            message: "You must enter a title"
        }, {
            pattern: /^[a-z0-9 \,\.\!\?\-\'\*]+$/i,
            message: "Only 1 or more letters-digits-spaces allowed"
        }],
        released: [{
            required: true,
            message: "You must enter release date"
        }, {
            pattern: /^((19[1-9][0-9])|(20[0-1][0-6]))$/,
            message: "Release date must be between 1910 and 2016"
        }],
        director: [{
            required: true,
            message: "You must enter a director's name"
        }, {
            pattern: /^[a-z0-9 \,\.\!\?\-\'\*]+$/i,
            message: "Only 1 or more letters-digits-spaces allowed"
        }],
        rating: [{
            required: true,
            message: "You must enter a rating"
        }, {
            pattern: /^(G|PG|PG-13|R|NC-17|NR)$/i,
            message: "Only MPAA ratings allowed"
        }],
        starring: [{
            required: true,
            message: "You must enter starring actors/actrices"
        }, {
            pattern: /^([a-z \-\']+([\,][a-z \-\'])?)+$/i,
            message: "Only comma-separated words are allowed"
        }],
        duration: [{
            required: true,
            message: "You must enter a duration",
        }, {
            pattern: /^([0-9]|([1-9][0-9]{1,2}))$/,
            message: "Duration must be between 0 and 999"
        }],
        genre: [{
            required: true,
            message: "You must enter a genre"
        }, {
            pattern: /^([a-z \-\']+([\,][a-z \-\'])?)+$/i,
            message: "Only comma-separated words are allowed"
        }],
        synopsis: [{
            required: true,
            message: "You must enter a synopsis"
        }, {
            pattern: /^(.*\w+.*)+$/,
            message: "Only words are allowed"
        }],
        trailer: [{
            // (scheme://)(host.name)(optional /resource)(optional /)
            pattern: /^(https?:\/\/)(\w+(\.[\w\-])?)+(\/?[\w\-\.\:\#]+)*(\/)?$/,
            message: "You must enter a valid URL"
        }]
    }
});
