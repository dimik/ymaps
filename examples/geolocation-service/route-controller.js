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
