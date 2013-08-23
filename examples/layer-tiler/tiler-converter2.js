/**
 * @fileOverview Создание пользовательского слоя в АПИ 2.0 из объекта,
 * сгенеренного приложением "Подготовка слоя тайлов".
 * @see http://api.yandex.ru/maps/doc/jsapi/1.x/dg/concepts/ymapstiler.xml
 * @author <a href="mailto:dimik@yandex.ru">Dmitry Poklonskiy</a>
 * @example
 * // Забираем этот объект из выдачи приложения "Подготовка слоя тайлов".
 * var options = {
 *         tileUrlTemplate: "./%z/tile-%x-%y.png",
 *         controls: {
 *             typeControl: true,
 *             miniMap: true,
 *             toolBar: true,
 *             scaleLine: true
 *         },
 *         scrollZoomEnabled: true,
 *         mapCenter: new YMaps.GeoPoint(37.6248443637416, 55.7451076621026),
 *         backgroundMapType: YMaps.MapType.MAP,
 *         mapZoom: 15,
 *         isTransparent: true,
 *         smoothZooming: false,
 *         layerKey: "my#layer",
 *         mapType: {
 *             name: "Мой слой",
 *             textColor: "#000000"
 *         },
 *         copyright: ""
 *     };
 *
 * ymaps.ready(function () {
 *     // Передаем его в конструктор класса TilerConverter и получаем ссылку на карту.
 *     var myMap = (new TilerConverter(options)).getMap();
 * });
 */

/**
 * @deprecated
 * Для совместимости с API 1.x
 */
YMaps = {
    MapType: {
        MAP: 'yandex#map',
        SATELLITE: 'yandex#satellite',
        HYBRID: 'yandex#hybrid',
        NONE: ''
    },
    GeoPoint: function (long, lat) {
        return [lat, long];
    }
};

/**
 * Класс конвертора для опций пользовательского слоя.
 * @class
 * @name TilerConverter
 * @param {Object} options Опции, сгенеренные приложением "Подготовка слоя тайлов".
 */
function TilerConverter(options) {
    this._options = options;

    // Создание слоя.
    this._layer = this._createLayer();
    // Добавим слой в хранилище слоев под ключом options.layerKey.
    ymaps.layer.storage.add(options.layerKey, this._layer);

    // Создание типа карты.
    this._mapType = this._createMapType();
    // Добавим в хранилище типов карты.
    ymaps.mapType.storage.add(options.layerKey, this._mapType);

    // Создание карты.
    this._map = this._createMap();
    // Добавление карте контролов и поведений.
    this
        ._addControls()
        ._enableBehaviors();
}

/**
 * @lends TilerConverter.prototype.
 */
TilerConverter.prototype = {
    /**
     * @constructor
     */
    constructor: TilerConverter,
    /**
     * Возвращает экземпляр карты.
     * @function
     * @name TilerConverter.getMap
     * @returns {ymaps.Map} Карта.
     */
    getMap: function () {
        return this._map;
    },
    /**
     * Возвращает конструктор пользовательского слоя.
     * @function
     * @name TilerConverter.getLayer
     * @returns {Function} Конструктор пользовательского слоя.
     */
    getLayer: function () {
        return this._layer;
    },
    /**
     * Возвращает экземпляр пользовательского типа карты.
     * @function
     * @name TilerConverter.getMapType
     * @returns {ymaps.MapType} Пользовательский тип карты.
     */
    getMapType: function () {
        return this._mapType;
    },
    /**
     * Создание экземпляра карты.
     * @private
     * @function
     * @name TilerConverter._createMap
     * @returns {ymaps.Map} Карта.
     */
    _createMap: function () {
        var options = this._options;

        return new ymaps.Map(options.mapID || "YMapsID", {
            center: options.mapCenter,
            zoom: options.mapZoom,
            type: options.layerKey,
            behaviors: ['default']
        }, {
            // projection: new ymaps.projection.Cartesian([[0.5, -0.5], [0.5, -0.5]]),
            // projection: new ymaps.projection.Cartesian([[-2136, 1424], [2136, -1424]]),
            adjustZoomOnTypeChange: true
        });
    },
    /**
     * Создание конструктора пользовательского слоя.
     * @private
     * @function
     * @name TilerConverter._createLayer
     * @returns {Function} Конструктор пользовательского слоя.
     */
    _createLayer: function () {
        var options = this._options;

        return function () {
            var layer = new ymaps.Layer(options.tileUrlTemplate, {
                    tileTransparent: options.isTransparent
                });

            // Копирайты
            if(options.copyright) {
                layer.getCopyrights = function () {
                    var promise = new ymaps.util.Promise();

                    promise.resolve(options.copyright);

                    return promise;
                };
            }

            // Диапазон доступных масштабов на данном слое карты (надо вручную дописать layerMaxZoom/layerMinZoom в options)
            if(options.layerMaxZoom >= 0 && options.layerMinZoom >= 0) {
                layer.getZoomRange = function () {
                    var promise = new ymaps.util.Promise();

                    promise.resolve([options.layerMinZoom, options.layerMaxZoom]);

                    return promise;
                };
            }

            return layer;
        };
    },
    /**
     * Создание экземпляра пользовательского типа карты.
     * @private
     * @function
     * @name TilerConverter._createMapType
     * @returns {ymaps.MapType} Пользовательский тип карты.
     */
    _createMapType: function () {
        var options = this._options,
            layers = options.backgroundMapType?
                ymaps.mapType.storage.get(options.backgroundMapType).getLayers() : [];

        return new ymaps.MapType(options.mapType.name, layers.concat([options.layerKey]));
    },
    /**
     * Добавление контролов.
     * @private
     * @function
     * @name TilerConverter._addControls
     * @returns {TilerConverter} Экземпляр конвертера.
     */
    _addControls: function () {
        var map = this._map,
            options = this._options,
            mapTypes = [
                // Наш тип.
                options.layerKey,
                // Все доступные в АПИ типы (не нужное закомментировать)
                'yandex#map',
                'yandex#satellite',
                'yandex#hybrid',
                'yandex#publicMap',
                'yandex#publicMapHybrid'
            ];

        if(options.controls.typeControl) {
            map.controls.add(new ymaps.control.TypeSelector(mapTypes));
        }
        if(options.controls.miniMap) {
            map.controls.add(new ymaps.control.MiniMap({ type: options.layerKey }));
            // Раскомментировать если нужно чтобы миникарта показывала схему, а не наш слой.
            // map.controls.add('miniMap');
        }
        if(options.controls.toolBar) {
            map.controls.add('mapTools');
        }
        if(options.controls.scaleLine) {
            map.controls.add('scaleLine');
        }
        map.controls.add('zoomControl');

        return this;
    },
    /**
     * Включение поведений карты.
     * @private
     * @function
     * @name TilerConverter._enableBehaviors
     * @returns {TilerConverter} Экземпляр конвертера.
     */
    _enableBehaviors: function () {
        if(this._options.scrollZoomEnabled) {
            this._map.behaviors.enable('scrollZoom');
        }

        return this;
    }
};
