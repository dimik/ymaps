/**
 * Класс оверлея маски.
 * @class
 * @name MaskOverlay
 * @param {ymaps.geometry.pixel.Polygon} geometry Пиксельная геометкрия полигона.
 * @param {ymaps.data.Manager} data Менеджер данных.
 * @param {ymaps.option.Manager} options Менеджер опций.
 */
function MaskOverlay(geometry, data, options) {
    MaskOverlay.superclass.constructor.call(this, geometry, data, options);
}

ymaps.ready(function () {
    /**
     * @lends MaskOverlay.prototype
     */
    ymaps.util.augment(MaskOverlay, ymaps.overlay.staticGraphics.Polygon, {
        /**
         * @constructor
         */
        constructor: MaskOverlay,
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

            return new ymaps.geometry.pixel.Polygon(lineCoordinates, 'evenOdd');
        }
    });
});
