define(['ready!ymaps', 'module'], function (ymaps, module) {
    var config = module.config();

    function MapView() {
        this._map = this._createMap();
        this._typeSelector = null;
    }

    MapView.prototype = {
        constructor: MapView,
        getMap: function () {
            return this._map;
        },
        render: function (layers) {
            this._map.setType(layers[0]);

            this._map.controls.add(
                this._typeSelector = this._createTypeSelector(layers)
            );
            this._map.layers.add(
                this._fixLayer = this._createFixLayer()
            );

            return this;
        },
        clear: function () {
            this._map.layers.remove(this._fixLayer);
            this._map.controls.remove(this._typeSelector);
        },
        _createMap: function () {
            return new ymaps.Map(
                config.container,
                config.state,
                ymaps.util.extend({}, config.options, {
                    projection: new ymaps.projection.Cartesian([[-10, -10], [10, 10]], [false, false])
                })
            );
        },
        _createTypeSelector: function (layers) {
            return new ymaps.control.TypeSelector({
                mapTypes: layers
            });
        },
        _createFixLayer: function () {
            return new ymaps.Layer("http://company.yandex.ru/i/researches/2013/music_ua/notFound.png", {
                zIndex: 0,
                notFoundTile: "http://company.yandex.ru/i/researches/2013/music_ua/notFound.png"
            });
        }
    };

    return MapView;
});
