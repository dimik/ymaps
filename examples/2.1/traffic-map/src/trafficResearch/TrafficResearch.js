ym.modules.define('TrafficResearch', [
    'util.defineClass',
    'Map',
    'layer.storage',
    'MapType',
    'mapType.storage',
    'control.TypeSelector',
    'projection.Cartesian',
    'TrafficResearch.component.TrafficLayer',
    'TrafficResearch.component.LegendControl'
], function (provide, defineClass, Map, layerStorage, MapType, mapTypeStorage, TypeSelector, Cartesian, TrafficLayer, LegendControl) {

    var TrafficResearch = defineClass(function (options) {
        var layer = this._layer = this._createLayer(options.layer);
        var mapType = this._mapType = this._createMapType(options.layer);
        var map = this._map = new Map(options.map.id, options.map, {
            projection: new Cartesian([[-1, -1], [1, 1]], [false, false])
        });

        map.controls.add(new LegendControl({ data: { content: '<img src="i/legend.png"/>' } }), { float: 'left', position: { bottom: 10, left: 10 }});
        map.setType(options.map.type);
    }, {
        _createLayer: function (options) {
            var layer = new TrafficLayer(options.tileUrlTemplate, options);
            layerStorage.add(options.id, layer);

            return layer;
        },
        _createMapType: function (options) {
            var mapType = new MapType(options.title, [options.id]);
            mapTypeStorage.add(options.id, mapType);

            return mapType;
        }
    });

    provide(TrafficResearch);
});
