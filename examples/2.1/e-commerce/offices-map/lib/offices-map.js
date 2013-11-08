define(function (require, exports, module) {

var GeoLocationModel = require('geolocation-model'),
    GeoObjectsModel = require('geoobjects-model'),
    RouteModel = require('route-model'),
    MapView = require('map-view'),
    RouteMapButtonView = require('route-map-button-view'),
    RouteMapView = require('route-map-view');

function OfficesMap() {
    this._mapView = new MapView();
    this._geoLocation = new GeoLocationModel();
    this._geoObjects = new GeoObjectsModel();
    this._router = new RouteModel();

    this._routeMapButtonView = null;
    this._routeMapView = null;
    this._origin = null;
    this._destination = null;
}

OfficesMap.prototype = {
    constructor: OfficesMap,
    init: function () {
        this._geoLocation.load()
            .always(this._onGeolocation, this)
            .always(this._onGeoObjects, this)
            // .fail(console.log);
    },
    _onGeolocation: function (promise) {
        this._mapView.create(this._geoLocation.getResult());

        return this._geoObjects.load();
    },
    _onGeoObjects: function (promise) {
        if(promise.isFulfilled()) {
            this._mapView.render(this._geoObjects.getResult());
            this._createRouteMapButtonView();
            this._routeMapButtonView.render();
            this._createRouteMapView();
        }
    },
    _createRouteMapButtonView: function () {
        this._routeMapButtonView = new RouteMapButtonView(this._mapView.getMap());
        this._attachButtonHandler();
    },
    _createRouteMapView: function () {
        this._routeMapView = new RouteMapView(this._mapView.getMap());
    },
    _clearRouteMapButtonView: function () {
        this._routeMapButtonView.clear();
        this._detachButtonHandler();
    },
    _attachButtonHandler: function () {
        this._routeMapButtonView.events
            .add('click', this._onRouteMapButtonClick, this);
    },
    _detachButtonHandler: function () {
        this._routeMapButtonView.events
            .remove('click', this._onRouteMapButtonClick, this);
    },
    _onRouteMapButtonClick: function (e) {
        if(e.get('state') === 'selected') {
            this._getRoute();
            this._attachRouteHandlers();
        }
        else {
            this._routeMapView.clear();
            this._clearRoutePoints();
            this._detachRouteHandlers();
        }
    },
    _getRoute: function () {
        var geolocation = this._geoLocation.getResult();

        this._router.load(
            this._origin || geolocation.geometry.getCoordinates(),
            this._destination || this._getClosestTo(geolocation).geometry.getCoordinates()
        ).always(this._onRoute, this);
    },
    _onRoute: function (promise) {
        var route = this._router.getResult();

        if(promise.isFulfilled()) {
            this._routeMapView
                .clear()
                .render(route);
            this._mapView
                .setBounds(route.properties.get('boundedBy'));
        }
    },
    _clearRoutePoints: function () {
        this._origin = null;
        this._destination = null;
    },
    _getClosestTo: function (point) {
        return this._geoObjects.getResult()
            .getClosestTo(point);
    },
    _attachRouteHandlers: function () {
        this._mapView.events
            .add(['click', 'search'], this._onAddRouteOrigin, this);
        this._geoObjects.getResult()
            .addEvents('click', this._onAddRouteDestination, this);
    },
    _detachRouteHandlers: function () {
        this._mapView.events
            .remove(['click', 'search'], this._onAddRouteOrigin, this);
        this._geoObjects.getResult()
            .removeEvents('click', this._onAddRouteDestination, this);
    },
    _onAddRouteOrigin: function (e) {
        this._origin = e.get('coords');
        this._getRoute();
    },
    _onAddRouteDestination: function (e) {
        e.preventDefault();
        this._destination = e.get('coords');
        this._getRoute();
    }
};

module.exports = OfficesMap;

});
