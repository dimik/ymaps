function DeliveryTarif(options) {
    this._options = options;
    this.events = new ymaps.event.Manager();
}

DeliveryTarif.prototype = {
    constructor: DeliveryTarif,
    getCoordinates: function () {
        $.ajax({
            url: this._options.url,
            dataType: 'json',
            success: $.proxy(this._onCoordinatesReceived, this)
        });

        return this;
    },
    _onCoordinatesReceived: function (json) {
        this.geometry = (new ymaps.GeoObject({ geometry: json })).geometry;
        this.events.fire('ready', {
            target: this
        });
    },
    _createPolyline: function (path) {
        this._polyline = new ymaps.Polyline(path, {
            hintContent: this._options.label
        }, {
            strokeColor: this._options.color,
            strokeWidth: 3
        });
    },
    setMap: function (map) {
        this._map = map;
        this.geometry.setMap(map);
        this.geometry.options.setParent(map.options);

        return this;
    },
    calculate: function (route) {
        var coordSystem = this._map.options.get('projection').getCoordSystem(),
            distance = 0,
            duration = 0,
            value = 0,
            path = [];

        route.legs.forEach(function (leg) {
            if(this.geometry.contains(leg.start_location) && this.geometry.contains(leg.end_location)) {
                distance += leg.distance;
                duration += leg.duration;
                path = path.concat(
                    leg.steps
                        .map(function (step) {
                            return step.path;
                        })
                        .reduce(function (a, b) {
                            return a.concat(b);
                        })
                );
            }
            else {
                path = path.concat(
                    leg.steps.filter(function (step) {
                        return this.geometry.contains(step.start_location) ||
                            this.geometry.contains(step.end_location);
                    }, this)
                    .map(function (step) {
                        return step.path;
                    })
                    .reduce(function (a, b) {
                        return a.concat(b);
                    })
                    .filter(function (point, i, points) {
                        return this.geometry.contains(point) ||
                            (points[i - 1] && this.geometry.contains(points[i - 1]));
                    }, this)
                );
/*
                leg.steps.forEach(function (step) {
                    if(this.geometry.contains(step.start_location)) {
                        if(this.geometry.contains(step.end_location)) {
                            distance += step.distance;
                            duration += step.duration;
                            path = path.concat(step.path);
                        }
                        else {
                            var i = 1, point;

                            path.push(step.start_location);
                            while(this.geometry.contains(point = step.path[i++])) {
                                distance += coordSystem.getDistance(step.path[i - 1], point);
                                path.push(point);
                            }
                            path.push(step.path[i]);
                        }
                    }
                    else if(this.geometry.contains(step.end_location)) {
                        var point;

                        for(var i = 1, len = step.path.length; i < len; i++) {
                            point = step.path[i];

                            if(this.geometry.contains(point)) {
                                distance += coordSystem.getDistance(step.path[i - 1], point);
                                path.push(point);
                            }
                        }
                    }
                }, this);
                */
            }
        }, this);

        this._createPolyline(path);

        return ymaps.util.extend({
            duration: Math.floor(duration),
            distance: Math.floor(distance),
            value: Math.floor(distance / 1000 * this._options.cost)
        }, this._options);
    },
    render: function (path) {
        if(this._map) {
            this._map.geoObjects.add(this._polyline);
        }
    },
    clear: function () {
        if(this._map && this._polyline) {
            this._map.geoObjects.remove(this._polyline);
        }
    }
}
