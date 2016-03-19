ym.modules.define('RS.MaskOverlay', [
  'util.defineClass',
  'overlay.Polygon',
  'geometry.pixel.Polygon'
], function (provide, defineClass, OverlayPolygon, GeometryPixelPolygon) {

/**
 * Класс оверлея маски.
 * @class
 * @name MaskOverlay
 * @param {ymaps.geometry.pixel.Polygon} geometry Пиксельная геометкрия полигона.
 * @param {Object} data Данные.
 * @param {Object} options Опции.
 */
var MaskOverlay = defineClass(function (geometry, data, options) {
    MaskOverlay.superclass.constructor.call(this, geometry, data, options);
}, OverlayPolygon, /** @lends MaskOverlay.prototype */{
    /**
     * Перекрываем публичный метод.
     * @function
     * @name MaskOverlay.setGeometry
     * @param {ymaps.geometry.pixel.Polygon} geometry Пиксельная геометрия полигона.
     */
    setGeometry: function (geometry) {
        MaskOverlay.superclass.setGeometry.call(
            this,
            this.getMap() ? this._createGeometry(geometry) : geometry
        );
    },
    /**
     * Создание пиксельной геометрии.
     * @function
     * @private
     * @name MaskOverlay._createGeometry
     * @returns {ymaps.geometry.pixel.Polygon} Пиксельная геометрия полигона.
     */
    _createGeometry: function (geometry) {
        var lineCoordinates = geometry.getCoordinates().slice(0),
            map = this.getMap(),
            center = map.getGlobalPixelCenter(),
            size = map.container.getSize(),
            d = 512;

        lineCoordinates.push([
            [center[0] - size[0] - d, center[1] - size[1] - d],
            [center[0] + size[0] + d, center[1] - size[1] - d],
            [center[0] + size[0] + d, center[1] + size[1] + d],
            [center[0] - size[0] - d, center[1] + size[1] + d],
            [center[0] - size[0] - d, center[1] - size[1] - d]
        ]);

        return new GeometryPixelPolygon(lineCoordinates, 'evenOdd');
    }
});

provide(MaskOverlay);

});
