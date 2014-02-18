function HeatMapLayer(map, params) {
    this._map = map;
    this._params = params;

    this._pane = null;
    this._view = null;
    this._dataset = null;
    this._bounds = new MapAreaBounds(map);

    this._createPane({ zIndex: 199 });
    this._setElementSize(map.container.getSize());
    this._createView(params);

    this._attachHandlers();
}

HeatMapLayer.prototype = {
    constructor: HeatMapLayer,
    _createView: function (params) {
        this._view = h337.create(ymaps.util.extend({
            element: this.getElement()
        }, params));

        return this;
    },
    getView: function () {
        return this._view;
    },
    _dropView: function () {
        this._view.cleanup();
        this._view = null;

        return this;
    },
    _createPane: function (params) {
        var map = this._map,
            pane = new ymaps.pane.MovablePane(map, params);

        map.panes.append('heatmap', this._pane = pane);

        return this;
    },
    getPane: function () {
        return this._pane;
    },
    _dropPane: function () {
        this._map.panes.remove(this._pane);
        this._pane.destroy();

        return this;
    },
    _attachHandlers: function () {
        this._map.events
            .add('sizechange', this._onMapSizeChange, this);

        this._pane.events
            .add('clientpixelschange', this._onPaneChange, this);
    },
    _detachHandlers: function () {
        this._pane.events
            .remove('clientpixelschange', this._onPaneChange, this);

        this._map.events
            .remove('sizechange', this._onMapSizeChange, this);
    },
    _onMapSizeChange: function (e) {
        var size = e.get('newSize');

        this
            ._setElementSize(size)
            ._dropView()
            ._createView(this._params);
        /*
        Doesn't work properly!!!
        this._view.set('width', size[0]);
        this._view.set('height', size[1]);
        this._view.resize();
        */
        this._redraw();
    },
    _onPaneChange: function (e) {
        this._redraw();
    },
    getElement: function () {
        return this._pane.getElement();
    },
    _setElementSize: function (size) {
        var el = this.getElement();

        el.style.width = size[0] + 'px';
        el.style.height = size[1] + 'px';

        return this;
    },
    getData: function () {
        return this._dataset;
    },
    setData: function (dataset) {
        this._dataset = dataset;
        this._redraw();

        return this;
    },
    _redraw: function () {
        // this._view.clear();
        // this._view.store.setDataSet(this._filterDataSetByBounds());
        var bounds = this._bounds.create().getGeometry();

        console.log(bounds.getPixelGeometry.getBounds());


        return this;
    },
    _filterDataSetByBounds: function () {
        var bounds = this._bounds.create().getGeometry(),
            data = this._dataset.data,
            result = {
                max: this._dataset.max,
                data: []
            },
            point, coords, localPixels;

            // console.log('map bounds: ', this._map.getBounds(), 'current action state bounds: ', bounds.getBounds());

        for(var i = 0, len = data.length; i < len; i++) {
            point = data[i];
            coords = [point.lat, point.lng];

            if(bounds.contains(coords)) {
                localPixels = this._getLocalCoordinates(coords);

                // console.log('latlng: ', point, 'local pixels: ', localPixels);

                result.data.push({
                    x: Math.floor(localPixels[0]),
                    y: Math.floor(localPixels[1]),
                    count: point.count
                });
            }
        }

        return result;
    },
    _getLocalCoordinates: function (coords) {
        var map = this._map,
            projection = map.options.get('projection');

        return this._pane.toClientPixels(
            projection.toGlobalPixels(coords, map.action.getCurrentState().zoom)
        );
    },
    destroy: function () {
        this._detachHandlers();
        this
            ._dropView()
            ._dropPane();

        return this;
    }
};

function MapAreaBounds(map) {
    this._map = map;
    this._geometry = null;
}

MapAreaBounds.prototype = {
    constructor: MapAreaBounds,
    getCoordinates: function () {
        var map = this._map,
            projection = map.options.get('projection'),
            state = map.action.getCurrentState(),
            center = state.globalPixelCenter,
            zoom = state.zoom,
            size = map.container.getSize(),
            gLobalPixelBounds = [
                [center[0] - size[0] / 2, center[1] + size[1] / 2],
                [center[0] + size[0] / 2, center[1] - size[1] / 2]
            ];

        return [
            projection.fromGlobalPixels(gLobalPixelBounds[0], zoom),
            projection.fromGlobalPixels(gLobalPixelBounds[1], zoom)
        ];
    },
    create: function () {
        var coordinates = this.getCoordinates();

        if(this._geometry) {
            this.setCoordinates(coordinates);
        }
        else {
            this._geometry = new ymaps.geometry.Rectangle(coordinates, { coordRendering: 'boundsPath' });
            this._geometry.setMap(this._map);
            this._geometry.options.setParent(this._map.options);
        }

        return this;
    },
    getGeometry: function () {
        return this._geometry;
    },
    setCoordinates: function (coordinates) {
        this._geometry.setCoordinates(coordinates);

        return this;
    },
    getBounds: function () {
        if(this._geometry) {
            return this._geometry.getBounds();
        }
        else {
            return null;
        }
    },
    destroy: function () {
        this._geometry.setMap(null);
        this._geometry.options.setParent(null);

        this._geometry = null;

        return this;
    }
};
