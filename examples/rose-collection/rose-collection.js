function RoseCollection(feature, options) {
    ObjectManager.superclass.constructor.call(this, feature,
        // По-умолчанию обрабатываем только точное совпадение координат.
        ymaps.util.extend({ margin: 0 }, options)
    );

    this._points = {};
    this._map = null;

    this.events.add('mapchange', this._onMapChange, this);
    this._map.events.add('boundschange', this._onMapBoundsChange, this);
}

ymaps.ready(function () {
    ymaps.util.augment(ObjectManager, ymaps.GeoObjectCollection, {
        add: function (object) {
            this.constructor.superclass.add.apply(this, arguments);

            var coordinates = object.geometry.getCoordinates(),
                points = this._points[coordinates];

            if(points) {
                points.push(object);
            }
            else {
                this._points[coordinates] = [object];
            }

            return this;
        },
        /**
         * Удаляет метку из диспетчера объектов.
         * @function
         * @name ObjectManager.remove
         * @param {ymaps.GeoObject} object Добавляемая метка.
         * @returns {ObjectManager} Для совместимости с АПИ 2.0.
         */
        remove: function (object) {
            this.constructor.superclass.remove.call(this, object);

            return this;
        },
        /**
         * Удаляет все метки и сбрасывает состояние.
         * @function
         * @name ObjectManager.removeAll
         * @returns {ObjectManager} Для совместимости с АПИ 2.0.
         */
        removeAll: function () {
            this.constructor.superclass.removeAll.call(this);

            this._points = [];

            return this;
        },
        /**
         * Обработчик смены масштаба карты.
         * @function
         * @private
         * @name ObjectManager._onBoundsChange
         * @param {ymaps.Event} e Объект-событие.
         */
        _onBoundsChange: function (e) {
            var zoom = e.get('newZoom');

            this.each(function (object, i) {
                var minZoom = this._zooms[i].minZoom,
                    maxZoom = this._zooms[i].maxZoom;

                object.options.set('visible', zoom >= minZoom && zoom <= maxZoom);

            }, this);
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
