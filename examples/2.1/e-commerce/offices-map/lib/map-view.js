define(['ready!ymaps', 'jquery', 'module'], function (ymaps, $, module) {

function MapView(options) {
    this._container = $('#' + module.config().container);
    this._options = options;
    this._map = null;
    this._clusterer = null;
    this.events = new ymaps.event.Manager();
};

MapView.prototype = {
    constructor: MapView,
    create: function (center) {
        var state = center && ymaps.util.bounds.getCenterAndZoom(
                center.properties.get('boundedBy'),
                [ this._container.width(), this._container.height() ],
                ymaps.projection.wgs84Mercator
            );

        this._map = new ymaps.Map(
            this._container.get(0),
            this._normalizeZoom(ymaps.util.extend(this.getDefaultState(), state)),
            this._options
        );
        this._addSearchControl();
        this._attachHandlers();
        this.showLocation(center);
    },
    _attachHandlers: function () {
        this.getSearchControl().events
            .add('resultselect', this._onSearchResultSelected, this);
        this._map.events
            .add('click', this._onMapClick, this);
    },
    _detachHandlers: function () {
        this.getSearchControl().events
            .remove('resultselect', this._onSearchResultSelected, this);
        this._map.events
            .remove('click', this._onMapClick, this);
    },
    _normalizeZoom: function (state) {
        return ymaps.util.extend({}, state, { zoom: Math.min(state.zoom, 10) });
    },
    _onMapClick: function (e) {
        this.events.fire('click', e);
    },
    _onSearchResultSelected: function (e) {
        var index = e.get('index'),
            result = e.get('target').getResultsArray()[index];

        this.events.fire('search', {
            target: e.get('target'),
            index: index,
            coords: result.geometry.getCoordinates()
        });
    },
    destroy: function () {
        this._map.destroy();
    },
    getMap: function () {
        return this._map;
    },
    render: function (geoObjects) {
        this._clusterer = this._createClusterer(geoObjects);
        this.add(this._clusterer);

        return this;
    },
    clear: function () {
        this.remove(this._clusterer);
        this._clusterer = null;

        return this;
    },
    add: function (geoObjects) {
        this._map.geoObjects
            .add(geoObjects);

        return this;
    },
    setBounds: function (bounds) {
        this._map.setBounds(bounds);
    },
    remove: function (geoObjects) {
        this._map.geoObjects
            .remove(geoObjects);

        return this;
    },
    _createClusterer: function (geoObjects) {
        return geoObjects.clusterize({
            preset: 'islands#invertedVioletClusterIcons',
            zoomMargin: 50
        });
    },
    showLocation: function (point) {
        if(point) {
            point.options.set('preset', 'islands#geolocationIcon');
            this._map.geoObjects
                .add(
                    this._location = point
                );
        }
    },
    hideGeolocation: function () {
        this._map.geoObjects
            .remove(this._location);
    },
    _addSearchControl: function () {
        var search = this._searchControl = new ymaps.control.SearchControl({
            options: {
                useMapBounds: true,
                // size: 'small',
                noSelect: true
            }
        });
        this._map.controls.add(search);
    },
    _removeSearchControl: function () {
        this._map.controls.remove(this._searchControl);
    },
    getSearchControl: function () {
        // return this._map.controls.get('searchControl');
        return this._searchControl;
    },
    getDefaultState: function () {
        return {
            center: [62.39938, 96.48178],
            zoom: 2,
            controls: ['geolocationControl', 'zoomControl', 'typeSelector', 'trafficControl', 'fullscreenControl']
        };
    }
};

return MapView;

});
