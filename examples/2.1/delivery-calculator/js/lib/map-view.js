define(['ready!ymaps', 'jquery', 'module'], function (ymaps, $, module) {

var config = module.config();

function MapView() {
    this._map = this._createMap();
    this._search = this._createSearch();
    this.events = new ymaps.event.Manager();

    this._map.controls.add(this._search);
    this._attachHandlers();
};

MapView.prototype = {
    constructor: MapView,
    render: function () {

        return this;
    },
    clear: function () {
        this._detachHandlers();
        this._map.controls.remove(this._search);
        this._map.destroy();

        return this;
    },
    _createMap: function () {
        return new ymaps.Map(
            config.container,
            config.state,
            config.options
        );
    },
    _createSearch: function () {
        return new ymaps.control.SearchControl({
            options: {
                useMapBounds: true,
                noCentering: true,
                noPlacemark: true
            }
        });
    },
    _attachHandlers: function () {
        this._search.events
            .add('resultshow', this._onSearchResultSelected, this);
        this._map.events
            .add('click', this._onMapClick, this);
    },
    _detachHandlers: function () {
        this._search.events
            .remove('resultshow', this._onSearchResultSelected, this);
        this._map.events
            .remove('click', this._onMapClick, this);
    },
    _onMapClick: function (e) {
        this.events.fire('destinationchange', e);
    },
    _onSearchResultSelected: function (e) {
        var index = e.get('index'),
            result = e.get('target').getResultsArray()[index];

        this.events.fire('destinationchange', {
            target: e.get('target'),
            index: index,
            coords: result.geometry.getCoordinates()
        });
    },
    getMap: function () {
        return this._map;
    },
    add: function (geoObjects) {
        this._map.geoObjects
            .add(geoObjects);

        return this;
    },
    remove: function (geoObjects) {
        this._map.geoObjects
            .remove(geoObjects);

        return this;
    },
    setBounds: function (bounds) {
        this._map.setBounds(bounds);

        return this;
    }
};

return MapView;

});
