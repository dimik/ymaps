IconsPreview.MapView = function (map) {
    this._map = map;
    this.events = new ymaps.event.Manager();
    this._clusterer = this._createClusterer();
    this._markerStyle = null;
    this._clusterStyle = null;
    this._generator = new RandomPointsGenerator();
    this._points = this._createMarkers();
};

IconsPreview.MapView.prototype = {
    constructor: IconsPreview.MapView,
    render: function (data) {
        if(this._clusterer.getLength() == 0) {
            this._map.geoObjects.add(
                this._clusterer.add(
                    this._points = this._createMarkers()
                )
            );
        }

        if(data) {
            this._setStyles(data);
        }

        return this;
    },
    clear: function () {
        this._map.geoObjects.remove(
            this._clusterer.removeAll()
        );

        this._points = null;
        this._markerStyle = null;
        this._clusterStyle = null;
        this._clusterer.options.unset('preset');

        return this;
    },
    _setStyles: function (data) {
        if(data.markerStyle) {
            this._setMarkerStyle(
                this._markerStyle = data.markerStyle
            );
        }
        if(data.clusterStyle) {
            this._setClusterStyle(
                this._clusterStyle = data.clusterStyle
            );
        }
    },
    _setClusterStyle: function (style) {
        this._clusterer.options.set('preset', style);
    },
    _setMarkerStyle: function (style) {
        for(var i = 0, len = this._points.length; i < len; i++) {
            this._points[i].options.set('preset', style);
            this._points[i].properties.set('iconContent', ~style.indexOf('Stretchy') && 'Контент' || '');
        }
    },
    _createMarkers: function () {
        return this._generator.generate(100).atBounds(
            this._map.getBounds()
        );
    },
    _createClusterer: function () {
        return new ymaps.Clusterer();
    }
};
