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
