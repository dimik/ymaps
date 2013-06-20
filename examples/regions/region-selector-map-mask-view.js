RegionSelector.MapMaskView = function (map) {
    this._map = map;
    this._overlay = null;
    this._geometry = null;
};

RegionSelector.MapMaskView.prototype = {
    constructor: RegionSelector.MapMaskView,
    render: function (data) {
        var coordinates = [];

        data.get('regions')
            .each(function (geoObject) {
                coordinates.push.apply(coordinates, geoObject.geometry.getCoordinates());
            });

        this._createGeometry(coordinates);
        this._createOverlay(this._geometry.getPixelGeometry());
        this._attachHandlers();

        return this;
    },
    clear: function () {
        if(this._geometry) {
            this._detachHandlers();
            this._geometry.setMap(null);
            this._overlay.setMap(null);
        }
        this._geometry = this._overlay = null;

        return this;
    },
    _attachHandlers: function () {
        this._geometry.events
            .add('pixelgeometrychange', this._onPixelGeometryChange, this);
        this._map.events
            .add('actionend', this._onActionEnd, this);
    },
    _detachHandlers: function () {
        this._map.events
            .remove('actionend', this._onActionEnd, this);
        this._geometry.events
            .remove('pixelgeometrychange', this._onPixelGeometryChange, this);
    },
    _onPixelGeometryChange: function (e) {
        this._createOverlay(e.get('newPixelGeometry'));
    },
    _onActionEnd: function () {
        this._createOverlay(this._geometry.getPixelGeometry());
    },
    _createGeometry: function (coordinates) {
        this._geometry = new ymaps.geometry.Polygon(coordinates, 'evenOdd',{
            projection: this._map.options.get('projection')
        });
        this._geometry.setMap(this._map);
    },
    _createOverlay: function (geometry) {
        if(!this._overlay) {
            this._overlay = new MaskOverlay(geometry, null, this.getDefaults());
        }
        this._overlay.setMap(this._map);
        this._overlay.setGeometry(geometry);
    },
    getDefaults: function () {
        return {
            zIndex: 1,
            stroke: false,
            strokeColor: false,
            fillColor: 'rgba(0,0,0,1)'
        };
    }
};
