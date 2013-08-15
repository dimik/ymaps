function RouteController(map) {
    this._map = map;
    this._model = new RouteController.Model(map);
    this._mapView = new RouteController.MapView(map);
}

RouteController.prototype = {
    constructor: RouteController,
    route: function (points) {
        this._model.load(points)
            .then(
                ymaps.util.bind(this._onRouteLoaded, this),
                ymaps.util.bind(this._onRouteFailed, this)
            );
    },
    clearRoute: function () {
        this._mapView
            .clear();
    },
    _onRouteLoaded: function (res) {
        this._mapView
            .clear()
            .render(res);
    },
    _onRouteFailed: function (err) {
        if(window.console) {
            console.log(err);
        }
    }
};

RouteController.Model = function (map) {
    this._map = map;
    this._route = null;
    this._error = null;
};

RouteController.Model.prototype = {
    constructor: RouteController.Model,
    load: function (points) {
        this.clear();

        return ymaps.route(points, this.getDefaults()).then(
            ymaps.util.bind(this._onRouteLoaded, this),
            ymaps.util.bind(this._onRouteFailed, this)
        );
    },
    clear: function () {
        this._route = null;
        this._error = null;
    },
    _onRouteLoaded: function (res) {
        this._route = res;
    },
    _onRouteFailed: function (err) {
        this._error = err;
    },
    getRoute: function () {
        return this._route;
    },
    getError: function () {
        return this._error;
    },
    getDefaults: function () {
        return {
            boundedBy: this._map.getBounds()
        };
    }
};

RouteController.MapView = function (map) {
    this._map = map;
    this._route = new ymaps.GeoObjectCollection({}, this.getDefaults());
};

RouteController.MapView.prototype = {
    constructor: RouteController.MapView,
    render: function (route) {
        var wayPoints = route.getWayPoints();

        this._route
            .add(route.getPaths())
            .add(this._createOrigin(wayPoints.get(0).geometry.getCoordinates()))
            .add(this._createDestination(wayPoints.get(1).geometry.getCoordinates()));

        this._map
            .setBounds(route.properties.get('boundedBy'))
            .geoObjects
                .add(this._route);

        return this;
    },
    clear: function () {
        this._map.geoObjects
            .remove(
                this._route
                    .removeAll()
            );

        return this;
    },
    _createOrigin: function (coordinates) {
        return new ymaps.Placemark(coordinates, {}, {
            iconImageHref: 'geolocation.png',
            iconImageSize: [24, 24],
            iconImageOffset: [-12, -12]
        });
    },
    _createDestination: function (coordinates) {
        return new ymaps.Placemark(coordinates, {
            iconContent: 'Яндекс'
        }, {
            preset: 'twirl#redStretchyIcon'
        });
    },
    getDefaults: function () {
        return {
            /*
            strokeColor: '0000ffff',
            strokeWidth: 8,
            opacity: 0.9
            */
            preset: 'router#route'
        };
    }
};
