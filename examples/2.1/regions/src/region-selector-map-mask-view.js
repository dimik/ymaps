ym.modules.define('RS.MapMaskView', [
  'util.defineClass',
  'geometry.Polygon',
  'RS.MaskOverlay'
], function (provide, defineClass, GeometryPolygon, MaskOverlay) {

/**
 * Класс-отображение данных на карте ввиде маски.
 * @class
 * @name RegionSelector.MapMaskView
 * @param {ymaps.Map} map Карта.
 */
var MapMaskView = defineClass(function (map) {
    this._map = map;
    this._overlay = null;
    this._geometry = null;
}, /** @lends RegionSelector.MapMaskView.prototype */{
    /**
     * Отображение данных на карте.
     * @function
     * @name RegionSelector.MapMaskView.render
     * @param {ymaps.data.Manager} data Менеджер данных.
     * @returns {RegionSelector.MapMaskView} Возвращает ссылку на себя.
     */
    render: function (data) {
        var coordinates = [];

        data.get('regions')
            .each(function (geoObject) {
                coordinates.push.apply(coordinates, geoObject.geometry.getCoordinates());
            });

        this._createGeometry(coordinates);
        this._createOverlay(this._geometry.getPixelGeometry());
        this._attachHandlers();

        return this;
    },
    /**
     * Удаление данных с карты.
     * @function
     * @name RegionSelector.MapMaskView.clear
     * @returns {RegionSelector.MapMaskView} Возвращает ссылку на себя.
     */
    clear: function () {
        if(this._geometry) {
            this._detachHandlers();
            this._geometry.setMap(null);
            this._overlay.setMap(null);
        }
        this._geometry = this._overlay = null;

        return this;
    },
    /**
     * Добавление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.MapMaskView._attachHandlers
     */
    _attachHandlers: function () {
        this._geometry.events
            .add('pixelgeometrychange', this._onPixelGeometryChange, this);
        this._map.events
            .add('boundschange', this._onBoundsChange, this);
    },
    /**
     * Удаление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.MapMaskView._detachHandlers
     */
    _detachHandlers: function () {
        this._map.events
            .remove('boundschange', this._onBoundsChange, this);
        this._geometry.events
            .remove('pixelgeometrychange', this._onPixelGeometryChange, this);
    },
    /**
     * Обработчик события изменения пискельной геометрии.
     * @function
     * @private
     * @name RegionSelector.MapMaskView._onPixelGeometryChange
     * @param {ymaps.data.Manager} e Менеджер данных.
     */
    _onPixelGeometryChange: function (e) {
        this._createOverlay(e.get('pixelGeometry'));
    },
    /**
     * Обработчик события смены центра/масштаба карты.
     * @function
     * @private
     * @name RegionSelector.MapMaskView._onBoundsChange
     */
    _onBoundsChange: function (e) {
        if(e.get('oldZoom') !== e.get('newZoom')) {
            this._createOverlay(this._geometry.getPixelGeometry());
        }
    },
    /**
     * Создание геометрии типа "Polygon".
     * @function
     * @private
     * @name RegionSelector.MapMaskView._createGeometry
     * @param {Number[][]} coordinates Координаты вершин ломаных, определяющих внешнюю и внутренние границы многоугольника.
     */
    _createGeometry: function (coordinates) {
        this._geometry = new GeometryPolygon(coordinates, 'evenOdd',{
            projection: this._map.options.get('projection')
        });
        this._geometry.setMap(this._map);
    },
    /**
     * Создание оверлея.
     * @function
     * @private
     * @name RegionSelector.MapMaskView._createOverlay
     * @param {ymaps.geometry.pixel.Polygon} geometry Пиксельная геометрия полигона.
     */
    _createOverlay: function (geometry) {
        if(!this._overlay) {
            this._overlay = new MaskOverlay(geometry, null, this.getDefaults());
        }
        this._overlay.setMap(this._map);
        this._overlay.setGeometry(geometry);
    },
    /**
     * Опции по-умолчанию.
     * @function
     * @name RegionSelector.MapMaskView.getDefaults
     * @returns {Object} Опции.
     */
    getDefaults: function () {
        return {
            zIndex: 1,
            stroke: false,
            strokeColor: false,
            fillColor: 'CCC'
        };
    }
});

provide(MapMaskView);

});
