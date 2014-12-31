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
        this._currentObject = null;

        this._drawingControl = new DrawingControl();
        map.controls.add(this._drawingControl);

        this.state.set(defaultState);
        this._stateMonitor = new Monitor(this.state);
        this._setupMonitor();

        this._setupListeners();
    }, GeoObjectCollection, {
        _setupListeners: function () {
            this.events
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
            if(isEditing) {
                this._listenRightClick();
            }
            else {
                this._unlistenRightClick();
            }
        },
        _listenMapClick: function () {
            this._map.events.add('click', this._onMapClick, this);
        },
        _unlistenMapClick: function () {
            this._map.events.remove('click', this._onMapClick, this);
        },
        _listenRightClick: function (e) {
            this.events.add('contextmenu', this._onRightClick, this);
        },
        _unlistenRightClick: function (e) {
            this.events.remove('contextmenu', this._onRightClick, this);
        },
        _onRightClick: function (e) {
            this._openEditMenu(e.get('coords'));
        },
        _openEditMenu: function () {
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
        _onMapClick: function (e) {
            this.state.set('drawing', false);

            var coordinates = e.get('coords');
            var geoObject = this._currentObject = this._createGeoObject(coordinates);
            this.add(geoObject);
            geoObject.editor.startDrawing();
            geoObject.events.once('editorstatechange', function () {
                geoObject.editor.stopEditing();
                this._deselectDrawingControl();
            }, this);
        },
        _onControlSelect: function (e) {
            var target = e.get('target');

            this.state.set({
                geometryType: target.data.get('geometryType'),
                drawing: true
            });
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
