function RouteSelector(map, container) {
    this._model = new RouteSelectorModel();
    this._domView = new RouteSelectorDomView(container);
    this._mapView = new RouteSelectorMapView(map);

    this._attachHandlers();
    this._model.getData();
}

RouteSelector.prototype = {
    constructor: RouteSelector,
    _attachHandlers: function () {
        this._model.events.on('change', $.proxy(this._onModelChanged, this));
        this._domView.events.on('itemselected', $.proxy(this._onItemSelected, this));
    },
    _detachHandlers: function () {
        this._model.events.off();
        this._domView.events.off();
    },
    _onModelChanged: function (e) {
        var items = e.dataset.items,
            index = e.dataset.activeItem;

        this._mapView.render(items);
        this._domView.render(items);
        this.setActiveItem(index);
    },
    _onItemSelected: function (e) {
        var index = e.itemIndex;

        this.unsetActiveItem()
            .setActiveItem(index);
    },
    setActiveItem: function (index) {
        this._domView
            .setActiveItem(index);
        this._mapView
            .setActiveItem(index);

        return this;
    },
    unsetActiveItem: function () {
        this._domView
            .unsetActiveItem();
        this._mapView
            .unsetActiveItem();

        return this;
    }
};
