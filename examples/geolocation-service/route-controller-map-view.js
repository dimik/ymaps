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
            // .add(this._createOrigin(wayPoints.get(0).geometry.getCoordinates()))
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
