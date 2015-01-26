ymaps.modules.define('LocationTool.component.MapView', [
    'Placemark',
    'data.Manager',
    'util.defineClass',
    'util.bind'
], function (provide, Placemark, DataManager, defineClass, bind) {
    /**
     * Класс отображения на карте Инструмента определения координат.
     * @class
     * @name MapView
     * @param {ymaps.Map} map Карта.
     */
    var MapView = defineClass(function (map) {
        this._map = map;
        // Интервал обновления данных (millisec) при кинетическом движении карты.
        this._updateTimeout = 10;
        this._marker = this._createDraggableMarker();
        map.geoObjects.add(this._marker);
        this.state = new DataManager({
            mapCenter: map.getCenter(),
            mapZoom: map.getZoom(),
            markerPosition: map.getCenter()
        });
        this._setupListeners();
    }, /** @lends MapView.prototype */{
        /**
         * Навешиваем обработчики.
         * @function
         * @private
         * @name MapView._setupListeners
         */
        _setupListeners: function () {
            this._map.events
                .add('boundschange', this._onMapBoundsChange, this)
                .add('actiontick', this._onMapAction, this)
                /* Во время плавного движения карты, у браузеров поддерживающих CSS3 Transition,
                 * actiontick не кидается, поэтому используем этот прием через setInterval.
                 */
                .add('actionbegin', this._onMapActionBegin, this)
                .add('actionend', this._onMapActionEnd, this);

            this._marker.events
                .add('drag', this._onMarkerDrag, this);
        },
        /**
         * Снимаем обработчики.
         * @function
         * @private
         * @name MapView._detachListeners
         */
        _detachListeners: function () {
            this._marker.events
                .remove('drag', this._onMarkerDrag, this);

            this._map.events
                .remove('boundschange', this._onMapBoundsChange, this)
                .remove('actiontick', this._onMapAction, this)
                .remove('actionbegin', this._onMapActionBegin, this)
                .remove('actionend', this._onMapActionEnd, this);
        },
        /**
         * Обработчик перетаскивания метки.
         * @function
         * @private
         * @name MapView._onMarkerDrag
         * @param {ymaps.Event} e Объект-событие
         */
        _onMarkerDrag: function (e) {
            this.state.set({
                markerPosition: e.get('target').geometry.getCoordinates()
            });
        },
        /**
         * Обработчик начала плавного движения карты.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml#event-actionbegin
         * @function
         * @private
         * @name MapView._onMapActionBegin
         * @param {ymaps.Event} e Объект-событие
         */
        _onMapActionBegin: function (e) {
            if(this._intervalId) {
                return;
            }

            this._intervalId = window.setInterval(
                bind(this._onMapAction, this),
                this._updateTimeout
            );
        },
        /**
         * Обработчик окончания плавного движения карты.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml#event-actionend
         * @function
         * @private
         * @name MapView._onMapActionEnd
         * @param {ymaps.Event} e Объект-событие
         */
        _onMapActionEnd: function (e) {
            window.clearInterval(this._intervalId);
            this._intervalId = null;
        },
        /**
         * Обработчик исполнения нового шага плавного движения.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml#event-actiontick
         * @function
         * @private
         * @name MapView._onMapAction
         * @param {ymaps.Event} e Объект-событие
         */
        _onMapAction: function (e) {
            /**
             * Определяет состояние карты в момент ее плавного движения.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/map.action.Manager.xml#getCurrentState
             */
            var state = this._map.action.getCurrentState(),
                zoom = state.zoom,
                /**
                 * Преобразует пиксельные координаты на указанном уровне масштабирования в координаты проекции (геокоординаты).
                 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IProjection.xml#fromGlobalPixels
                 */
                center = this._map.options.get('projection').fromGlobalPixels(
                    state.globalPixelCenter, zoom
                );

            this.state.set({
                mapCenter: center,
                mapZoom: zoom
            });
        },
        /**
         * Обработчик события изменения области просмотра карты (в результате изменения центра или уровня масштабирования)
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml#event-boundschange
         * @function
         * @private
         * @name MapView._onMapBoundsChange
         * @param {ymaps.Event} e Объект-событие
         */
        _onMapBoundsChange: function (e) {
            this.state.set({
                mapCenter: e.get('newCenter'),
                mapZoom: e.get('newZoom')
            });
        },
        /**
         * Создание перетаскиваемого маркера.
         * @function
         * @private
         * @name MapView._createDraggableMarker
         */
        _createDraggableMarker: function () {
            return new Placemark(this._map.getCenter(), {
                hintContent: 'Перетащите метку'
            }, {
                draggable: true,
                pane: 'controls'
            });
        }
    });

    provide(MapView);
});
