function DirectionsService(options) {
    this._avoidTrafficJams = options.avoidTrafficJams;
}

DirectionsService.prototype = {
    constructor: DirectionsService,
    route: function (request, callback) {
        var self = this,
            mGeocoder = new MultiGeocoder(),
            waypoints = [request.origin]
                .concat(request.waypoints || [], [request.destination]);

        mGeocoder.geocode(waypoints).then(function (geocoder) {
            ymaps.route(waypoints, request).then(function (route) {
                callback({
                    routes: [{
                        bounds: route.properties.get('boundedBy'),
                        legs: self._getLegs(route.getPaths(), {
                            geocoderResults: geocoder.geoObjects,
                        })
                    }]
                });
            });
        });
    },
    _getLegs: function (paths, params) {
        var legs = [];

        paths.each(function (path, i) {
            var start = params.geocoderResults.get(i),
                end = params.geocoderResults.get(i + 1);

            legs.push({
                distance: path.getLength(),
                duration:  this._avoidTrafficJams ? path.getJamsTime() : path.getTime(),
                start_address: start.properties.get('text'),
                end_address: end.properties.get('text'),
                start_location: start.geometry.getCoordinates(),
                end_location: end.geometry.getCoordinates(),
                steps: this._getSteps(path.getSegments(), params)
            });
        }, this);

        return legs;
    },
    _getSteps: function (segments, params) {
        return segments.map(function (segment) {
            var path = segment.getCoordinates();

            return {
                distance: segment.getLength(),
                duration: this._avoidTrafficJams ? segment.getJamsTime() : segment.getTime(),
                instructions: segment.getHumanAction(),
                path: path,
                street: segment.getStreet(),
                start_location: path[0],
                end_location: path[path.length - 1]
            };
        });
    }
};
