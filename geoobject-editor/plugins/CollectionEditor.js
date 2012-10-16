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

            collection.events
                .add('contextmenu', this.onEditingStart, this)
                .add('actionedit', this.onActionEdit, this)
                .add('actiondelete', this.onActionDelete, this);

            return this;
        },

        /**
         * Stop editing collection items.
         * @function
         * @name CollectionEditor.startEditing
         */
        stopEditing: function () {
            var collection = this.geoObjects;

            collection.events
                .remove('contextmenu', this.onEditingStart, this)
                .remove('actionedit', this.onActionEdit, this)
                .remove('actiondelete', this.onActionDelete, this);

            return this;
        },

        /**
         * Start drawning (creating) collection items.
         * @function
         * @name CollectionEditor.startDrawing
         * @param {Object} [options] Reserved for customization.
         */
        startDrawing: function (options) {
            var map = this.getMap(),
                collection = this.geoObjects;

            map.events.add('click', this.onDrawingStart, this);
            collection.events.add('actioncreate', this.onActionCreate, this);

            return this;
        },

        /**
         * Stop drawing (creating) collections items.
         * @function
         * @name CollectionEditor.stopDrawing
         */
        stopDrawing: function () {
            var map = this.getMap(),
                collection = this.geoObjects;

            map.events.remove('click', this.onDrawingStart, this);
            collection.events.remove('geoobjectcreate', this.onGeoObjectCreated, this);

            return this;
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

        onDrawingStart: function (e) {
            var coordinates = e.get('coordPosition'),
                collection = this.geoObjects;

            collection.balloon.open(coordinates, {
                geoObjects: collection,
                coordPosition: coordinates
            }, {
                contentLayout: this.view.getLayout('createMenu')
            });
        },

        onEditingStart: function (e) {
            var coordinates = e.get('coordPosition'),
                collection = this.geoObjects,
                geoObject = e.get('target');

            collection.balloon.open(coordinates, {
                geoObjects: collection,
                geoObject: geoObject,
                coordPosition: coordinates
            }, {
                contentLayout: this.view.getLayout('editMenu')
            });
        },

        onActionCreate: function (e) {
            var coordPosition = e.get('coordPosition'),
                center = coordPosition.map(function (i) { return i.toFixed(6); }),
                collection = e.get('target'),
                geometry = e.get('geometry'),
                geoObject = new ymaps.GeoObject({
                    geometry: geometry,
                    properties: { center: center }
                }),
                geoObjectEditor = new GeoObjectEditor(geoObject);

            collection.balloon.close();
            collection.add(geoObject);
            geoObjectEditor.startDrawing();
        },

        onActionEdit: function (e) {
            var collection = e.get('target'),
                geoObject = e.get('geoObject'),
                geoObjectEditor = new GeoObjectEditor(geoObject);

            collection.balloon.close();
            geoObjectEditor.startEditing();
        },

        onActionClone: function (e) {},

        onActionDelete: function (e) {
            var collection = e.get('target'),
                geoObject = e.get('geoObject');

            collection.balloon.close();
            collection.remove(geoObject);
        }
    };

    return CollectionEditor;
});
