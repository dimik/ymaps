define(['ready!ymaps', 'CollectionEditorView', 'GeoObjectEditor'], function (ymaps, CollectionEditorView, GeoObjectEditor) {

    function CollectionEditor(collection) {
        this.geoObjects = collection;
        this.view = new CollectionEditorView();
    }

    CollectionEditor.prototype = {
        constructor: CollectionEditor,

        /**
         * Start editing collection items.
         * @function
         * @name CollectionEditor.startEditing
         * @param {Object} [options] Reserved for customization.
         */
        startEditing: function (options) {
            var collection = this.geoObjects;

            // collection.events.add('contextmenu', this.onEdit, this);
        },

        /**
         * Stop editing collection items.
         * @function
         * @name CollectionEditor.startEditing
         */
        stopEditing: function () {},

        /**
         * Start drawning (creating) collection items.
         * @function
         * @name CollectionEditor.startDrawing
         * @param {Object} [options] Reserved for customization.
         */
        startDrawing: function (options) {
            var map = this.getMap(),
                collection = this.geoObjects;

            map.events.add('click', this.onMapClick, this);
            collection.events.add('geoobjectcreate', this.onGeoObjectCreated, this);
        },

        /**
         * Stop drawing (creating) collections items.
         * @function
         * @name CollectionEditor.stopDrawing
         */
        stopDrawing: function () {
            var map = this.getMap(),
                collection = this.geoObjects;

            map.events.remove('click', this.onMapClick, this);
            collection.events.remove('geoobjectcreate', this.onGeoObjectCreated, this);
        },

        /**
         * Get map to which collection was added.
         * @function
         * @name CollectionEditor.getMap
         * @returns {ymaps.Map}
         */
        getMap: function () {
            var map = this.geoObjects.getMap();

            if(!map) {
                throw new Error('EditableGeoObjectCollection must be added on map for drawing');
            }

            return map;
        },

        onMapClick: function (e) {
            var coordinates = e.get('coordPosition'),
                collection = this.geoObjects;

            collection.balloon.open(coordinates, {
                geoObjects: collection,
                coordPosition: coordinates
            }, {
                contentLayout: this.view.getLayout('createMenu')
            });
        },

        onGeoObjectCreated: function (e) {
            var geoObject = e.get('geoObject'),
                collection = e.get('target');

            collection.balloon.close();
            collection.add(geoObject);
            geoObject.editor = new GeoObjectEditor(geoObject);
            geoObject.editor.startDrawing();
        }
    };

    return CollectionEditor;
});
