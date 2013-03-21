function DirectionsRenderer(options) {
    this.events = new ymaps.event.Manager();
    this._options = {
        markerOptions: {},
        polylineOptions: ymaps.option.presetStorage.get('router#route')
    };
    this._routeIndex = this._options.routeIndex = 0;
    this._polyline = null;
    this._markers = new ymaps.GeoObjectArray();

    this.setOptions(options);
}

DirectionsRenderer.ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

DirectionsRenderer.prototype = {
    constructor: DirectionsRenderer,
    setDirections: function (directions) {
        this._directions = directions;

        if(directions && this._map) {
            this._render();
        }
    },
    getDirections: function () {
        return this._directions;
    },
    getMap: function () {
        return this._map;
    },
    setMap: function (map) {
        this._map = map;

        if(map) {
            this._markers.options.setParent(map.options);
            this._markers.setParent(map.geoObjects);

            if(this._directions) {
                this._render();
            }
        }
    },
    getRouteIndex: function () {
        return this._routeIndex;
    },
    setRouteIndex: function (index) {
        this._routeIndex = index;

        if(this._directions && this._map) {
            this._render();
        }
    },
    setOptions: function (options) {
        for(var key in options) {
            this._options[key] = options[key];
        }

        if(options.draggable != null) {
            this._options.markerOptions.draggable = options.draggable;
        }

        if(options.directions) {
            this._directions = options.directions;
        }

        if(options.routeIndex >= 0 && options.routeIndex !== this._routeIndex) {
            this._routeIndex = options.routeIndex;
        }

        if('map' in options) {
            this.setMap(options.map);

            return;
        }

        if(this._map && this._directions) {
            this._render();
        }
    },
    _clear: function () {
        this._detachHandlers();
        this._markers.removeAll();

        if(this._polyline) {
            this._map.geoObjects.remove(this._polyline);
        }
    },
    _createPolyline: function (coordinates) {
        if(!this._options.suppressPolylines) {
            this._polyline = new ymaps.Polyline(coordinates, {}, this._options.polylineOptions);
            this._map.geoObjects.add(this._polyline);
        }
    },
    _updateViewport: function (bounds) {
        if(!this._options.preserveViewport) {
            this._map.setBounds(bounds);
        }
    },
    _onDragEnd: function () {
        this.events.fire('waypointschange', {
            origin: this._markers.get(0).geometry.getCoordinates(),
            destination: this._markers.get(1).geometry.getCoordinates()
        });
    },
    _attachHandlers: function () {
        if(this._options.draggable) {
            this._markers.events.add('dragend', this._onDragEnd, this);
        }
    },
    _detachHandlers: function () {
        this._markers.events.remove('dragend', this._onDragEnd, this);
    },
    _createMarker: function (coordinates, data, options) {
        return new ymaps.Placemark(coordinates, data, options || this._options.markerOptions);
    },
    _createMarkers: function (leg, index) {
        if(!this._options.suppressMarkers) {
            this._markers
                .add(this._createMarker(leg.start_location, {
                    iconContent: DirectionsRenderer.ALPHABET.charAt(index),
                    balloonContent: leg.start_address
                }))
                .add(this._createMarker(leg.end_location, {
                    iconContent: DirectionsRenderer.ALPHABET.charAt(index + 1),
                    balloonContent: leg.end_address
                }));
        }
    },
    _render: function () {
        var coordinates = [],
            route = this._directions.routes[this._routeIndex];

        this._clear();

        route.legs.forEach(function (leg, i) {
            this._createMarkers(leg, i);

            leg.steps.forEach(function (step) {
                coordinates = coordinates.concat(step.path);
            });
        }, this);

        this._createPolyline(coordinates);
        this._updateViewport(route.bounds);
        this._attachHandlers();
    }
};
