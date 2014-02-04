define(['jquery', 'ready!ymaps'], function (jQuery, ymaps) {

function DeliveryTarif(options) {
    this.events = new ymaps.event.Manager();

    this._options = options;
    this._geometry = null;
    this._paths = new ymaps.GeoObjectCollection(null, {
        strokeColor: this._options.color,
        strokeWidth: 3
    });
    this._map = null;
}

DeliveryTarif.prototype = {
    constructor: DeliveryTarif,
    init: function () {
        jQuery.ajax({
            url: this._options.url,
            dataType: 'json',
            success: this._onCoordinatesReceived,
            context: this
        });

        return this;
    },
    setMap: function (map) {
        this._map = map;
        this._geometry.setMap(map);
        this._geometry.options.setParent(map.options);
        map.geoObjects.add(this._paths);

        return this;
    },
    getName: function () {
        return this._options.name;
    },
    getPaths: function () {
        return this._paths;
    },
    contains: function (point) {
        return this._geometry.contains(point);
    },
    estimate: function (route) {
        var options = this._options,
            geometry = this._geometry,
            paths = this._paths,
            coordinates = this._getCoordinates(route),
            addPath = function (path) {
                paths.add(new ymaps.Polyline(path, {
                    hintContent: options.label
                }));
            },
            setLastPoint = function (point) {
                var polyline = paths.get(paths.getLength() - 1);

                polyline.geometry.set(polyline.geometry.getLength(), point);
            };

        if(typeof options.contains === 'function') {
            if(options.contains.call(this, route)) {
                addPath(coordinates);
                return;
            }
        }
        if(typeof options.notContains === 'function') {
            if(options.notContains.call(this, route)) {
                return;
            }
        }
        coordinates.forEach(function (point, i) {
            if(geometry.contains(point)) {
                if(paths.getLength() === 0) {
                    addPath([point]);
                }
                else {
                    if(coordinates[i - 1] && geometry.contains(coordinates[i - 1])) {
                        setLastPoint(point);
                    }
                    else {
                        addPath([point]);
                    }
                }
            }
            else if(coordinates[i - 1] && geometry.contains(coordinates[i - 1])) {
                setLastPoint(point);
            }
        });
    },
    clear: function () {
        this._paths.removeAll();
        this._distance = 0;

        return this;
    },
    getDistance: function () {
        this._paths.each(function (path) {
            this._distance += path.geometry.getDistance();
        }, this);

        return this._distance;
    },
    getPrice: function () {
        var isFixed = this._options.fixed,
            rate = this._options.rate;

        return isFixed?
            rate : Math.floor(this._distance / 1000 * rate);
    },
    _onCoordinatesReceived: function (json) {
        this._geometry = (new ymaps.GeoObject({ geometry: json })).geometry;
        this.events.fire('ready', {
            target: this
        });
    },
    _getCoordinates: function (route) {
        var flatten = function (a, b) { return a.concat(b); };

        return route.legs
            .map(function (leg) {
                return leg.steps;
            })
            .reduce(flatten)
            .map(function (step) {
                return step.path;
            })
            .reduce(flatten);
    }
}

return DeliveryTarif;

});
