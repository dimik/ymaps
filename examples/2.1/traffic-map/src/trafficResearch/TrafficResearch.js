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
        var layers = this._layers = this._createLayers(options.layers);
        var mapTypes = this._mapTypes = this._createMapTypes(options.layers);
        var map = this._map = new Map(options.map.id, options.map, {
            projection: new Cartesian([[-1, -1], [1, 1]], [false, false])
        });

        map.controls.add(new TypeSelector({ mapTypes: mapTypes, data: { content: 'Показать' } }));
        map.controls.add(new LegendControl({ data: { content: '<img src="i/legend.png"/>' } }), { float: 'left', position: { bottom: 10, left: 10 }});
        map.setType(options.map.type);
    }, {
        _createLayers: function (layers) {
            return layers.map(function (options) {
                var layer = new TrafficLayer(options.tileUrlTemplate, options);
                layerStorage.add(options.id, layer);

                return layer;
            });
        },
        _createMapTypes: function (layers) {
            return layers.map(function (options) {
                var mapType = new MapType(options.title, [options.id]);
                mapTypeStorage.add(options.id, mapType);

                return mapType;
            });
        }
    });

    provide(TrafficResearch);
});
