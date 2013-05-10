function RouteSelectorMapView(map) {
    this._map = map;
    this._routes = [];
    this._data = null;
    this._activeItem = null;
}

RouteSelectorMapView.prototype = {
    constructor: RouteSelectorMapView,
    render: function (data) {
        this._data = data;

        return this;
    },
    clear: function () {
        this._routes = [];
        this._data = null;
        this.unsetActiveItem();

        return this;
    },
    setActiveItem: function (index) {
        var route = this._routes[index];

        if(route) {
            this._map.geoObjects.add(
                this._activeItem = route
            );
        }
        else {
            var self = this,
                coords = this._data[index].path;

            this._getRoute(coords, function (route) {
                self._map.geoObjects.add(
                    self._activeItem = self._routes[index] = route
                );
            });
        }

        return this;
    },
    unsetActiveItem: function () {
        if(this._activeItem) {
            this._map.geoObjects.remove(this._activeItem);
            this._activeItem = null;
        }

        return this;
    },
    _getRoute: function (coords, callback) {
        ymaps.route(coords, {
            mapStateAutoApply: true
        }).then(callback);
    }
};
