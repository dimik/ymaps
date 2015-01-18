ym.modules.define('GeoObjectEditor', [
    'util.defineClass',
    'Monitor',
    'GeoObject',
    'GeoObjectCollection',
    'GeoObjectEditor.component.DrawingControl',
    'GeoObjectEditor.component.styles'
], function (provide, defineClass, Monitor, GeoObject, GeoObjectCollection, DrawingControl, styles) {
    var defaultState = {
        editing: false,
        drawing: false,
        geometryType: 'Point'
    };
    var GeoObjectEditor = defineClass(function (map) {
        GeoObjectEditor.superclass.constructor.apply(this, arguments);

        this._map = map;
        map.geoObjects.add(this);

        this._mapCursor = null;
        this._activeObject = null;
        this._activeObjectEditorMonitor = null;

        this._drawingControl = new DrawingControl();
        map.controls.add(this._drawingControl);

        this.state.set(defaultState);
        this._stateMonitor = new Monitor(this.state);
        this._setupMonitor();

        this._setupListeners();
    }, GeoObjectCollection, {
        _setupListeners: function () {
            this.events
                .add('editorstatechange', this._onChildEditorStateChange, this)
                .add('remove', this._onChildRemove, this)
                .add('mapchange', this._onMapChange, this);
            this._drawingControl.events
                .add('select', this._onControlSelect, this)
                .add('deselect', this._onControlDeselect, this);
        },
        _setupMonitor: function () {
            this._stateMonitor
                .add('drawing', this._onDrawingChange, this)
                .add('editing', this._onEditingChange, this);
        },
        _onChildEditorStateChange: function (e) {
            var geoObject = e.get('target');

            if(this._activeObject !== geoObject) {
                this.unsetActiveObject();
                this.setActiveObject(geoObject);
                this._onActiveObjectEditingChange(geoObject.editor.state.get('editing'));
            }
        },
        _onChildRemove: function (e) {
            var geoObject = e.get('child');

            if(geoObject === this._activeObject) {
                this.unsetActiveObject();
            }
        },
        _onDrawingChange: function (isDrawing) {
            if(isDrawing) {
                this._listenMapClick();
                this._addMapCursor();
            }
            else {
                this._removeMapCursor();
                this._unlistenMapClick();
            }
        },
        _onEditingChange: function (isEditing) {
        },
        _listenMapClick: function () {
            this._map.events.add('click', this._onMapClick, this);
        },
        _unlistenMapClick: function () {
            this._map.events.remove('click', this._onMapClick, this);
        },
        _addMapCursor: function () {
            this._mapCursor = this._map.cursors.push('crosshair');
        },
        _removeMapCursor: function () {
            this._mapCursor.remove();
        },
        startDrawing: function () {
            this.state.set('drawing', true);
        },
        startEditing: function () {
            this.state.set('editing', true);
        },
        stopDrawing: function () {
            this.state.set('drawing', false);
        },
        stopEditing: function () {
            this.state.set('editing', false);
        },
        setActiveObject: function (geoObject) {
            if(geoObject !== this._activeObject) {
                this._activeObject = geoObject;
                this._setupActiveObjectEditorMonitor();
            }
        },
        unsetActiveObject: function () {
            var activeObject = this._activeObject;

            if(activeObject) {
                this._clearActiveObjectEditorMonitor();
                if(activeObject.editor.state.get('drawing')) {
                    activeObject.editor.stopDrawing();
                }
                if(activeObject.editor.state.get('editing')) {
                    activeObject.editor.stopEditing();
                }
                if(activeObject.balloon.isOpen()) {
                    activeObject.balloon.close();
                }
                activeObject.state.set('editing', false);
            }
        },
        _setupActiveObjectEditorMonitor: function () {
            var activeObject = this._activeObject;

            if(activeObject) {
                var monitor = this._activeObjectEditorMonitor = new Monitor(activeObject.editor.state);
                monitor.add('drawing', this._onActiveObjectDrawingChange, this);
                monitor.add('editing', this._onActiveObjectEditingChange, this);
            }
        },
        _clearActiveObjectEditorMonitor: function () {
            if(this._activeObjectEditorMonitor) {
                this._activeObjectEditorMonitor.removeAll();
            }

            this._activeObjectEditorMonitor = null;
        },
        _onActiveObjectDrawingChange: function (drawing) {
            var activeObject = this._activeObject;

            if(!drawing) {
                activeObject.editor.stopEditing();
                activeObject.balloon.open();
                this._deselectDrawingControl();
            }
        },
        _onActiveObjectEditingChange: function (editing) {
            var activeObject = this._activeObject;

            activeObject.options.set('draggable', editing);
            activeObject.state.set('editing', editing);
        },
        _onMapClick: function (e) {
            var geoObject = this._createGeoObject(e.get('coords'));

            this.add(geoObject);
            this.setActiveObject(geoObject);
            geoObject.editor.startDrawing();
            this.state.set('drawing', false);
        },
        _onControlSelect: function (e) {
            var target = e.get('target');

            this.state.set({
                geometryType: target.data.get('geometryType'),
                drawing: true
            });
            this.unsetActiveObject();
        },
        _onControlDeselect: function (e) {
            var target = e.get('target');
            var geometryType = target.data.get('geometryType');
            var state = this.state;

            if(state.get('geometryType') === geometryType && state.get('drawing')) {
                state.set('drawing', false);
            }
        },
        _deselectDrawingControl: function () {
            this._drawingControl.each(function (btn) {
                if(btn.isSelected()) {
                    btn.deselect();
                }
            });
        },
        _createGeoObject: function (coordinates) {
            var geometryType = this.state.get('geometryType');

            switch(geometryType) {
                case 'Polygon':
                    coordinates = [[coordinates]];
                    break;
                case 'LineString':
                    coordinates = [coordinates];
                    break;
            }

            return new GeoObject({
                geometry: {
                    type: geometryType,
                    coordinates: coordinates
                }
            }, {
                preset: 'GeoObjectEditor#' + geometryType
            });
        }
    });

    provide(GeoObjectEditor);
});
