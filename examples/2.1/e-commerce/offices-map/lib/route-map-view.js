define(['ready!ymaps'], function (ymaps) {

function RouteMapView(map) {
    this._map = map;
};

RouteMapView.prototype = {
    constructor: RouteMapView,
    render: function (data) {
        var route = this._route = data.getPaths();
        route.options.set('preset', 'router#route');

        this._map.geoObjects
            .add(route);

        return this;
    },
    clear: function () {
        if(this._route) {
            this._map.geoObjects
                .remove(this._route);
            this._route = null;
        }

        return this;
    },
    getMap: function () {
        return this._map;
    },
    setMap: function (map) {
        this._map = map;

        return this;
    }
};

return RouteMapView;

});
