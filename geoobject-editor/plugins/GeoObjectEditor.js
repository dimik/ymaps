define(['ready!ymaps', 'GeoObjectEditorView', 'GeoObjectView'], function (ymaps, GeoObjectEditorView, GeoObjectView) {

    /**
     * Wrapper over the native api geometry editor.
     */
    function GeoObjectEditor(geoObject) {
        this.geoObject = geoObject;
        this.editor = geoObject.editor;
        this.geometry = geoObject.geometry.getType();

        if(this.editor) {
            this.options = this.editor.options;
            this.editor.events
                .add('statechange', this.onStateChange, this);
        }

        this.events = new ymaps.event.Manager({ context: this })
            .add('drawingstart', this.onDrawingStart, this)
            .add('drawingstop', this.onDrawingStop, this)
            .add('editingstart', this.onEditingStart, this)
            .add('editingstop', this.onEditingStop, this);
    }

    GeoObjectEditor.prototype = {
        constructor: GeoObjectEditor,

        /**
         * Start editing geoObject.
         * @function
         * @name GeoObjectEditor.startEditing
         */
        startEditing: function () {
            var editor = this.editor;

            this.events.fire('editingstart');

            if(editor && editor.startEditing) {
                editor.startEditing.apply(editor, arguments);
            }
            /*
            else {
                this.events.fire('editingstop');
            }
            */
        },

        /**
         * Stop editing collection items.
         * @function
         * @name GeoObjectEditor.startEditing
         */
        stopEditing: function () {
            var editor = this.editor;

            if(editor && editor.stopEditing) {
                editor.stopEditing.apply(editor, arguments);
            }
            else {
                this.events.fire('editingstop');
            }
        },

        /**
         * Start drawning (creating) collection items.
         * @function
         * @name GeoObjectEditor.startDrawing
         */
        startDrawing: function () {
            var editor = this.editor;

            this.events.fire('drawingstart');

            if(editor && editor.startDrawing) {
                editor.startDrawing.apply(editor, arguments);
            }
            else {
                this.events.fire('drawingstop');
            }
        },

        /**
         * Stop drawing (creating) collections items.
         * @function
         * @name GeoObjectEditor.stopDrawing
         */
        stopDrawing: function () {
            var editor = this.editor;

            if(editor && editor.stopDrawing) {
                editor.stopDrawing.apply(editor, arguments);
            }
            else {
                this.events.fire('drawingstop');
            }
        },

        onStateChange: function (e) {
            if(e.get('newDrawing') === false) {
                this.events.fire('drawingstop');
            }
            if(e.get('newEditing') === false) {
                this.events.fire('editingstop');
            }
        },

        onEditingStart: function () {
            var geoObject = this.geoObject,
                geometry = this.geometry,
                view = new GeoObjectEditorView();

            geoObject.options.set({
                balloonContentBodyLayout: view.getLayout('editForm'),
                balloonFieldsetLayout: view.getLayout(geometry + 'Fieldset'),
                balloonActionsLayout: view.getLayout('editFormActions'),
                hideIconOnBalloonOpen: false
            });

            geoObject.properties.set({
                balloon: geoObject.balloon.open(),
                view: new GeoObjectView()
            });
        },
        onEditingStop: function () {
            var geoObject = this.geoObject,
                view = new GeoObjectView();

            geoObject.balloon.close();
            geoObject.properties
                .unset('balloon')
                .unset('view');
            geoObject.options
                .unset('hideIconOnBalloonOpen')
                .set('balloonContentBodyLayout', view.getLayout('balloonContent'));
        },
        onDrawingStart: function () {},
        onDrawingStop: function () {
            this.startEditing();
        }
    };

    return GeoObjectEditor;
});
