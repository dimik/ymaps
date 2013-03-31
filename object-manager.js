/**
 * Диспетчер объектов.
 * Позволяет скрывать и показывать объекты на карте, в зависимости от текущего коэффициента масштабирования.
 * Аналог класса YMaps.ObjectManager из Яндекс.АПИ 1.x
 * @see http://api.yandex.ru/maps/doc/jsapi/1.x/ref/reference/objectmanager.xml
 * @class
 * @augments ymaps.GeoObjectArray
 * @name ObjectManager
 * @param {Object} [feature] Описание группы.
 * @param {Object} [options] Опции группы.
 */
function ObjectManager(feature, options) {
    ObjectManager.superclass.constructor.call(this, feature,
        // Для оптимизации сделаем метки на canvas по-умолчанию.
        ymaps.util.extend({ overlayFactory: 'default#interactiveGraphics' }, options)
    );

    this._zooms = [];
    this._map = null;

    this.events.add('mapchange', this._onMapChange, this);
}

ymaps.ready(function () {
    ymaps.util.augment(ObjectManager, ymaps.GeoObjectArray, {
        /**
         * Добавляет метку диспетчер объектов.
         * @function
         * @name ObjectManager.add
         * @param {ymaps.GeoObject} object Добавляемая метка.
         * @param {Number} [minZoom=0] Минимальное значение коэффициента масштабирования, при котором метка будет видна.
         * @param {Number} [maxZoom=Infinity] Максимальное значение коэффициента масштабирования, при котором метка будет видна.
         * @returns {ObjectManager} Для совместимости с АПИ 2.0.
         */
        add: function (object, minZoom, maxZoom) {
            this.constructor.superclass.add.call(this, object);

            var zoom = this._map && this._map.getZoom(),
                minZoom = minZoom >= 0 ? minZoom : 0,
                maxZoom = maxZoom >= 0 ? maxZoom : Infinity;

            this._zooms.push({
                minZoom: minZoom,
                maxZoom: maxZoom
            });

            if(zoom >= 0) {
                object.options.set('visible', zoom >= minZoom && zoom <= maxZoom);
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
            this._zooms.splice(this.indexOf(object), 1);

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

            this._zooms = [];

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
