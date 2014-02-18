define(['ready!ymaps', 'module'], function (ymaps, module) {
    var config = module.config();

    function MapView() {
        this.events = new ymaps.event.Manager();

        this._map = this._createMap();
        this._map.controls.get('fullscreenControl').select();
        this._typeSelector = null;
    }

    MapView.prototype = {
        constructor: MapView,
        getMap: function () {
            return this._map;
        },
        render: function (layers) {
            this._attachHandlers();
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
            this._detachHandlers();
            this._map.layers.remove(this._fixLayer);
            this._map.controls.remove(this._typeSelector);
        },
        _attachHandlers: function () {
            this._map.events
                .add('typechange', this._onTypeChange, this);
        },
        _detachHandlers: function () {
            this._map.events
                .remove('typechange', this._onTypeChange, this);
        },
        _onTypeChange: function (e) {
            var map = e.get('target');

            this.events.fire('typechange', {
                target: map,
                type: 'typechange',
                value: map.getType()
            });
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
                data: { content: 'Показать' },
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
