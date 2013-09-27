function RoseCollection(feature, options) {
    RoseCollection.superclass.constructor.call(this, feature,
        // По-умолчанию обрабатываем только точное совпадение координат.
        ymaps.util.extend({ margin: 0 }, options)
    );

    this._points = {};
    this._offset = options.offset || 100;
    this._circle = null;
    this._map = null;

    this.events.add('mapchange', this._onMapChange, this);
    this._map.events.add('boundschange', this._onMapBoundsChange, this);
}

ymaps.ready(function () {
    ymaps.util.augment(RoseCollection, ymaps.GeoObjectCollection, {
        _getRadius: function () {
            var projection = this._map.options.get('projection'),
                zoom = this._map.getZoom(),
                start = this._map.getPixelCenter(),
                end = [start[0], start[1] + this._offset];

            return projection.getCoordSystem().getDistance(
                projection.fromGlobalPixels(start, zoom),
                projection.fromGlobalPixels(end, zoom)
            );
        },
        _createCircle: function () {
            this._circle = new ymaps.geometry.Circle(
                this._map.getCenter(),
                this._getRadius(),
                this._map.options
            ).getPixelGeometry();
        },
        /**
         * Обработчик смены карты.
         * @function
         * @private
         * @name ObjectManager._onMapChange
         * @param {ymaps.Event} e Объект-событие.
         */
        _onMapChange: function (e) {
            var map = e.get('newMap');

            if(this._map != map) {
                this._detachListeners();
                this._attachListeners(map);
            }

            this._map = map;
        },
        /**
         * Добавление обработчиков на карту.
         * @function
         * @private
         * @name ObjectManager._attachListeners
         * @param {ymaps.Map} map Карта.
         */
        _attachListeners: function (map) {
            if(map) {
                map.events.add('boundschange', this._onBoundsChange, this);
            }
        },
        /**
         * Удаление обработчиков с карты.
         * @function
         * @private
         * @name ObjectManager._detachListeners
         */
        _detachListeners: function () {
            if(this._map) {
                this._map.events.remove('boundschange', this._onBoundsChange, this);
            }
        }
    });
});
