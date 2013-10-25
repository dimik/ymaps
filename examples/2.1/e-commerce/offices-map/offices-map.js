function OfficesMap() {
    this._mapView = new MapView($('#YMapsID'));
    this._model = new Model();
    this._routeMapButtonView = null;
    this._routeMapView = null;
    this._origin;
    this._destination;
    this.init();
}

OfficesMap.prototype = {
    constructor: OfficesMap,
    getModel: function () {
        return this._model;
    },
    init: function () {
        this._model.getLocation()
            .always(this._onGeolocation, this)
            .always(this._onData, this)
            .fail(console.log);
    },
    _onGeolocation: function (promise) {
        var model = this._model;

        this._mapView.create(model.get('location'));

        return model.getGeoObjects();
    },
    _onData: function (promise) {
        if(promise.isFulfilled()) {
            this._mapView.render(this._model.get('geoObjects'));
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
        var model = this._model,
            geolocation = model.get('location');

        model.getRoute(
            this._origin || geolocation.geometry.getCoordinates(),
            this._destination || this._getClosestTo(geolocation).geometry.getCoordinates()
        ).always(this._onRoute, this);
    },
    _onRoute: function (promise) {
        var route = this._model.get('route');

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
        return this._model.get('geoObjects')
            .getClosestTo(point);
    },
    _attachRouteHandlers: function () {
        this._mapView.events
            .add(['click', 'search'], this._onAddRouteOrigin, this);
        this._model.get('geoObjects')
            .addEvents('click', this._onAddRouteDestination, this);
    },
    _detachRouteHandlers: function () {
        this._mapView.events
            .remove(['click', 'search'], this._onAddRouteOrigin, this);
        this._model.get('geoObjects')
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

function RouteMapView(map) {
    this._map = map;
}

RouteMapView.prototype = {
    constructor: RouteMapView,
    render: function (route) {
        var route = this._route = route.getPaths();
        route.options.set('preset', 'router#route');

        this._map.geoObjects
            .add(route);

        return this;
    },
    clear: function () {
        if(this._route) {
            this._map.geoObjects
                .remove(this._route);
            this._route = null;
        }

        return this;
    },
    getMap: function () {
        return this._map;
    },
    setMap: function (map) {
        this._map = map;

        return this;
    }
};

function RouteMapButtonView(map) {
    this._map = map;
    this._button = null;
    this.events = new ymaps.event.Manager();
}

RouteMapButtonView.prototype = {
    constructor: RouteMapButtonView,
    render: function () {
        this._map.controls.add(
            this._button = this._createButton()
        );
        this._attachHandlers();

        return this;
    },
    clear: function () {
        this._map.controls
            .remove(this._button);
        this._detachHandlers();
        this._button = null;

        return this;
    },
    setMap: function (map) {
        this._map = map;

        return this;
    },
    getMap: function () {
        return this._map;
    },
    _attachHandlers: function () {
        this._button.events
            .add(['select', 'deselect'], this._onButtonClick, this);
    },
    _detachHandlers: function () {
        this._button.events
            .remove(['select', 'deselect'], this._onButtonClick, this);
    },
    _onButtonClick: function (e) {
        this.events.fire('click', {
            target: this,
            state: e.get('type') + 'ed'
        });
    },
    _createButton: function () {
        return new ymaps.control.Button(this.getDefaults());
    },
    getDefaults: function () {
        return {
            data: {
                content: 'Проложить маршрут',
                title: 'Проложить маршрут до ближайшего пункта выдачи'
            },
            options: {
                maxWidth: 150
            }
        };
    }
};

function MapView(container, options) {
    this._container = container;
    this._options = options;
    this._map = null;
    this._clusterer = null;
    this.events = new ymaps.event.Manager();
}

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
                noSelect: true,
                size: 'small'
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
            controls: ['geolocationControl', 'zoomControl', 'typeSelector', 'trafficControl']
        };
    }
};

function Model(options) {
    this._options = ymaps.util.extend(this.getDefaults(), options);
    this._data = new ymaps.data.Manager({
        location: null,
        route: null,
        geoObjects: null,
        error: null
    });
}

Model.prototype = {
    constructor: Model,
    get: function (key) {
        return this._data.get(key);
    },
    getGeoObjects: function () {
        var promise = new ymaps.vow.Promise(),
            data = this._data;

        $.ajax(this._options)
            .then(function (geoJSON) {
                var geoObjects = ymaps.geoQuery(geoJSON);

                data.set('geoObjects', geoObjects);
                promise.fulfill(geoObjects);
            }, function (err) {
                data.set('error', err);
                promise.reject(err);
            });

        return promise;
    },
    getLocation: function () {
        var promise = new ymaps.vow.Promise(),
            data = this._data;

        ymaps.geolocation.get(this._options)
            .then(function (res) {
                var geoObject = res.geoObjects.get(0);

                data.set('location', geoObject);
                promise.fulfill(geoObject);
            }, function (err) {
                data.set('error', err);
                promise.reject(err);
            });

        return promise;
    },
    getRoute: function (origin, destination) {
        var promise = new ymaps.vow.Promise(),
            data = this._data;

        ymaps.route([origin, destination], this._options)
            .then(function (route) {
                data.set('route', route);
                promise.fulfill(route);
            }, function (err) {
                data.set('error', err);
                promise.reject(err);
            });

        return promise;
    },
    getDefaults: function () {
        return {
            url: 'data.json',
            dataType: 'json',
            autoReverseGeocode: true,
            mapStateAutoApply: true
        };
    }
};
