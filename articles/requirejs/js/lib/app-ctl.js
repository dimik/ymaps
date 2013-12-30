define(['jquery', 'geoobjects-model', 'map-view'], function (jQuery, GeoObjectsModel, MapView) {

'use strict';

function AppCtl() {
    this._mapView = new MapView();
    this._geoObjects = new GeoObjectsModel();
}

AppCtl.prototype = {
    constructor: AppCtl,
    _attachHandlers: function () {
        this._geoObjects.events
            .on({
                'loaded': jQuery.proxy(this._onDataLoaded, this),
                'failed': jQuery.proxy(this._onDataFailed, this)
            });
        this._mapView.events
            .add('click', this._onMapClick, this);
    },
    _detachHandlers: function () {
        this._mapView.events
            .remove('click', this._onMapClick, this);
        this._geoObjects.events
            .off();
    },
    init: function () {
        this._geoObjects.load();
        this._attachHandlers();
    },
    _onDataLoaded: function (e) {
        this._mapView.render(e.geoObjects);
    },
    _onDataFailed: function (e) {
        if(window.console) {
            console.log(e.message);
        }
    },
    _onMapClick: function (e) {
        if(window.console) {
            console.log(e.get('coords'));
        }
    }
};

return AppCtl;

});
