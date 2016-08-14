/*jslint node: true*/
/*global Backbone: true, $: true, _: true */

'use strict';
var galactus =  galactus || {};

galactus.MovieImg = Backbone.View.extend({
    // Render the view
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    // Bind events
    events: {
        'change #file': 'selectImage',
        'dragover .poster': 'dragImage',
        'drop .poster': 'dropImage'
    },
    // Resize image in the format and quality specified
    /*
     * @param {[Object]} source: image content
     * @param {[String]} type: image format
     * @param {[Integer]} quality: image quality between 0 and 1
     * @param {[Function]} callback: callback function after resizing is done
     */
    resizeImage: function (source, type, quality, callback) {
        type = type || 'image/jpeg',
        quality = quality || 0.95;

        var image = new Image(), MAX_HEIGHT = 300, MAX_WIDTH = 450;

        image.onload = function () {
            var ratio = _.min([ MAX_WIDTH / image.width, MAX_HEIGHT / image.height ]);
            image.width *= ratio;
            image.height *= ratio;

            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;

            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, image.width, image.height);

            if (callback) {
                callback(canvas.toDataURL(type, quality));
            }
        }
        image.src = source;
    },
    // Read image from filesystem
    readImage: function (file) {
        if (/(gif|jpeg|png)$/.test(file.type)) {
            var self = this;
            var reader = new FileReader();
            // callback when read operation is finished
            reader.onload = function () {
                // callback when resize operation is finished
                self.resizeImage(reader.result, file.type, 0.9, function (image) {
                    self.$el.find('img')[0].src = image;
                    self.model.set('poster', image);
                });
            };
            // read image file
            reader.readAsDataURL(file);
        }
    },
    // Get image after selecting it
    /*
     * @param {[Object]} e: information about the fired event
     */
    selectImage: function (e) {
        if (e.target.files.length) {
            this.readImage(e.target.files[0]);
        }
    },
    // Handle image while dragging it
    /*
     * @param {[Object]} e: information about the fired event
     */
    dragImage: function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.originalEvent.dataTransfer.dropEffect = 'copy';
    },
    // Handle image after dropping it
    /*
     * @param {[Object]} e: information about the fired event
     */
    dropImage: function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.originalEvent.dataTransfer.files.length) {
            this.readImage(e.originalEvent.dataTransfer.files[0]);
        }
    }
});
