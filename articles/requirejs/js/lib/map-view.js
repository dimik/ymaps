define(['ready!ymaps', 'module'], function (ymaps, module) {

'use strict';

var config = module.config();

function MapView() {
    this.events = new ymaps.event.Manager();
    this._map = null;
    this._clusterer = null;

    this.init();
}

MapView.prototype = {
    constructor: MapView,
    init: function () {
        this._map = this._createMap();
        this._attachHandlers();

        return this;
    },
    destroy: function () {
        this._detachHandlers();
        this._map.destroy();
        this._map = null;

        return this;
    },
    getMap: function () {
        return this._map;
    },
    render: function (data) {
        this._clusterer = ymaps.geoQuery(data).clusterize();
        this._map.geoObjects.add(this._clusterer);
        this.setBounds(this._clusterer.getBounds());

        return this;
    },
    clear: function () {
        this._maps.geoObjects.remove(this._clusterer);
        this._clusterer = null;

        return this;
    },
    setBounds: function (bounds) {
        this._map.setBounds(bounds);
    },
    _createMap: function () {
        return new ymaps.Map(
            config.container,
            config.state,
            config.options
        );
    },
    _attachHandlers: function () {
        this._map.events
            .add('click', this._onMapClick, this);
    },
    _detachHandlers: function () {
        this._map.events
            .remove('click', this._onMapClick, this);
    },
    _onMapClick: function (e) {
        this.events.fire('click', e);
    }
};

return MapView;

});
