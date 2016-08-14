/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.Details = Backbone.View.extend({
    id: 'details',
    // Initialize the view
    initialize: function () {
        this.movieFormView = new galactus.MovieForm({ model: this.model });
        this.movieImgView = new galactus.MovieImg({ model: this.model });      
    },
    // Render the view
    render: function () {
        this.$el.html(this.template(this.model.toJSONC()));
        this.movieFormView.setElement(this.$('#form')).render();
        this.movieImgView.setElement(this.$('#img')).render();
        return this;
    },
    // Bind events
    events: {
        'click #save': 'save',
        'click #delete': 'delete'
    },
    // Save movie
    /*
     * @param {[Object]} e: information about the event
     */
    save: function (e) {
        e.preventDefault();
        galactus.utils.hideErrors(this.el);

        if (this.model.validateAll()) {
            var isNew = this.model.isNew();
            this.model.save({}, {
                wait: true,
                error: function (model, error) {
                    galactus.utils.showNotice('danger', error.responseText);
                },
                success: function (model) {
                    if (isNew) {
                        galactus.app.navigate('#movies/' + model.get('_id'), { replace: true, trigger: true });
                    }
                    galactus.utils.showNotice('success', 
                        '<strong>Success!</strong> Movie <em>"' + model.get('title') + '"</em> has been saved');
                }
            });
        } else {
            galactus.utils.showNotice('danger', '<strong>Error!</strong> Fix validation errors and try again');
            galactus.utils.showErrors(this.model.errors, this.el);
        }
    },
    // Delete movie
    /*
     * @param {[Object]} e: information about the event
     */
    'delete': function (e) {
        e.preventDefault();
        this.model.destroy({
            wait: true,
            error: function (model, error) {
                galactus.utils.showNotice('danger', error.responseText);
            },
            success: function (model) {
                galactus.app.navigate('#movies', { replace: true, trigger: true });
                galactus.utils.showNotice('success', 
                    '<strong>Success!</strong> Movie "' + model.get('title') + '" has been deleted');
            }
        });
    }
});
