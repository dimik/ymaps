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
    this._attachHandlers();
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
    },
    _attachHandlers: function () {
        this._mapView.events
            .add('typechange', this._onTypeChange, this);
    },
    _detachHandlers: function () {
        this._mapView.events
            .remove('typechange', this._onTypeChange, this);
    },
    _onTypeChange: function (e) {
        var type = e.get('value'),
            layer = jQuery.grep(this._layers, function (layer) {
                return layer.getName() == type;
            })[0];

        this._provideLegend(layer);
    }
};

return SeriesCtl;

});
