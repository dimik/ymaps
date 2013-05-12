function RouteSelectorMapView(map) {
    this._map = map;
    this._routes = new ListCollection();
    this._activeItem = null;
}

RouteSelectorMapView.prototype = {
    constructor: RouteSelectorMapView,
    render: function (data) {
        this._routes.properties.set('items', data);
        this._map.geoObjects.add(this._routes);

        return this;
    },
    clear: function () {
        this._routes.removeAll();
        this._map.geoObjects.remove(this._routes);
        this._routes.properties.unset('items');

        return this;
    },
    setActiveItem: function (index) {
        var route = this._routes.get(index);

        if(route) {
            (this._activeItem = route)
                .options.set('visible', true);
        }
        else {
            var self = this,
                coords = this._routes.properties.get('items')[index].path;

            this._getRoute(coords, function (route) {
                self._routes.add(
                    self._activeItem = route,
                    index
                );
            });
        }

        return this;
    },
    unsetActiveItem: function () {
        if(this._activeItem) {
            this._activeItem.options.set('visible', false);
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
