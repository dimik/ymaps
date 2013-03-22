function DirectionsService(options) {
    this._options = options || {};
}

DirectionsService.prototype = {
    constructor: DirectionsService,
    route: function (request, callback) {
        var self = this,
            waypoints = [request.origin].concat(request.waypoints || [], [request.destination]),
            geocoder = new MultiGeocoder();

        geocoder.geocode(waypoints).then(function (res) {
            ymaps.route(waypoints, self._options).then(function (route) {
                self._updateWaypoints(route.getWayPoints(), res.geoObjects);

                callback({ routes: [self._getRoute(route)] });
            });
        });
    },
    _getBounds: function (route) {
        return route && route.properties.get('boundedBy') || null;
    },
    _updateWaypoints: function (waypoints, source) {
        waypoints.each(function (waypoint, i) {
            waypoint.properties.set(
                source.get(i).properties.getAll()
            );
        });
    },
    _getLegs: function (route) {
        var waypoints = route.getWayPoints(),
            legs = [];

        route.getPaths().each(function (path, i) {
            var start = waypoints.get(i),
                end = waypoints.get(i + 1);

            legs.push(this._createLeg(start, end, path));
        }, this);

        return legs;
    },
    _createLeg: function (start, end, path) {
        return {
            distance: path.getLength(),
            duration: this._getDuration(path),
            start_address: start.properties.get('text'),
            end_address: end.properties.get('text'),
            start_location: start.geometry.getCoordinates(),
            end_location: end.geometry.getCoordinates(),
            steps: this._getSteps(path.getSegments())
        };
    },
    _getSteps: function (segments) {
        return segments.map(this._createStep, this);
    },
    _createStep: function (segment) {
        var path = segment.getCoordinates();

        return {
            distance: segment.getLength(),
            duration: this._getDuration(segment),
            instructions: segment.getHumanAction(),
            path: path,
            street: segment.getStreet(),
            start_location: path[0],
            end_location: path[path.length - 1]
        };
    },
    _getDuration: function (segment) {
        var avoidTrafficJams = this._options.avoidTrafficJams;

        return avoidTrafficJams ? segment.getJamsTime() : segment.getTime();
    },
    _getRoute: function (route) {
        return {
            bounds: this._getBounds(route),
            legs: this._getLegs(route)
        };
    }
};
