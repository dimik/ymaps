define(['ready!ymaps', 'jquery', 'module', 'map-view', 'user-layer-map-view', 'legend-map-view'], function (ymaps, jQuery, module, MapView, UserLayerMapView, LegendMapView) {

var config = module.config();

function SeriesCtl() {
    this._layers = this._createLayers();
    this._mapView = new MapView();
    this._legend = new LegendMapView(this._mapView.getMap());

    this._mapView.render(jQuery.map(this._layers, function (layer) {
        return layer.getName();
    }));

    this._legend.render(this._layers[0].getLegend());
}

SeriesCtl.prototype = {
    constructor: SeriesCtl,
    _createLayers: function () {
        return jQuery.map(config.layers, function (config) {
            return (new UserLayerMapView()).render(config);
        });
    },
    _provideLegend: function (layer) {
        if(layer.getLegend()) {
            this._legend
                .setContent(layer.getLegend())
                .show();
        }
        else {
            this._legend
                .hide();
        }
    }
};

return SeriesCtl;

});
