function DirectionsRenderer(options) {
    this.events = new ymaps.event.Manager();
    this._polyline = null;
    this._markers = new ymaps.GeoObjectArray();

    this._draggable = options.draggable;
    this._directions = options.directions;
    this._markerOptions = options.markerOptions || {};
    this._polylineOptions = options.polylineOptions || ymaps.option.presetStorage.get('router#route');
    this._routeIndex = options.routeIndex || 0;

    this._markerOptions.draggable = !!this._draggable;

    if(options.map) {
        this.setMap(options.map);
    }
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
    },
    _clear: function () {
        this._detachHandlers();
        this._markers.removeAll();

        if(this._polyline) {
            this._map.geoObjects.remove(this._polyline);
        }
    },
    _createPolyline: function (coordinates) {
        if(!this._suppressPolylines) {
            this._polyline = new ymaps.Polyline(coordinates, {}, this._polylineOptions);
            this._map.geoObjects.add(this._polyline);
        }
    },
    _updateViewport: function (bounds) {
        if(!this._preserveViewport) {
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
        if(this._draggable) {
            this._markers.events.add('dragend', this._onDragEnd, this);
        }
    },
    _detachHandlers: function () {
        this._markers.events.remove('dragend', this._onDragEnd, this);
    },
    _createMarker: function (coordinates, data, options) {
        return new ymaps.Placemark(coordinates, data, options || this._markerOptions);
    },
    _render: function () {
        var coordinates = [],
            route = this._directions.routes[this._routeIndex];

        this._clear();

        route.legs.forEach(function (leg, i) {
            if(!this._suppressMarkers) {
                this._markers
                    .add(this._createMarker(leg.start_location, {
                        iconContent: DirectionsRenderer.ALPHABET.charAt(i),
                        balloonContent: leg.start_address
                    }))
                    .add(this._createMarker(leg.end_location, {
                        iconContent: DirectionsRenderer.ALPHABET.charAt(i + 1),
                        balloonContent: leg.end_address
                    }));
            }

            leg.steps.forEach(function (step) {
                coordinates = coordinates.concat(step.path);
            });
        }, this);

        this._createPolyline(coordinates);
        this._updateViewport(route.bounds);
        this._attachHandlers();
    }
};
