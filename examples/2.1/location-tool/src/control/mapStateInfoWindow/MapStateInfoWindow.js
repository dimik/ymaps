ym.modules.define('control.MapStateInfoWindow', [
    'util.defineClass',
    'util.extend',
    'util.bind',
    'util.bounds',
    'collection.Item',
    'data.Manager',
    'layout.storage',
    'Monitor',
    'layout.MapStateInfoWindowLayout'
], function (provide, defineClass, extend, bind, bounds, CollectionItem, DataManager, layoutStorage, Monitor) {
    var MapStateInfoWindow = defineClass(function (options) {
        MapStateInfoWindow.superclass.constructor.call(this, options);

        this.state = new DataManager();
        this._intervalId = null;
        this._mapEvents = null;
    }, CollectionItem, {
        onAddToMap: function (map) {
            MapStateInfoWindow.superclass.onAddToMap.call(this, map);

            this.getParent().getChildElement(this).then(this._onChildElement, this);
        },

        onRemoveFromMap: function (oldMap) {
            if (this._mapEvents) {
                this._mapEvents.removeAll();
                this._mapEvents = null;
            }
            MapStateInfoWindow.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _onChildElement: function (parentDomContainer) {
            this._setInitialState();
            this._mapEvents = this.getMap().events.group();
            this._mapEvents
                .add('boundschange', this._onMapBoundsChange, this)
                .add('actiontick', this._onMapAction, this)
                /* Во время плавного движения карты, у браузеров поддерживающих CSS3 Transition,
                 * actiontick не кидается, поэтому используем этот прием через setInterval.
                 */
                .add('actionbegin', this._onMapActionBegin, this)
                .add('actionend', this._onMapActionEnd, this);

            var Layout = layoutStorage.get('control#mapstateinfo');

            this.layout = new Layout({ state: this.state });
            /**
             * Контрол будет добавляться в pane событий, чтобы исключить интерактивность.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#setParentElement
             */
            this.layout.setParentElement(parentDomContainer);

        },
        _setInitialState: function () {
            var map = this.getMap();

            this.state.set({
                mapCenter: map.getCenter(),
                mapZoom: map.getZoom(),
                mapBounds: map.getBounds()
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
            var map = this.getMap(),
                projection =  map.options.get('projection'),
                state = map.action.getCurrentState(),
                zoom = state.zoom,
                /**
                 * Преобразует пиксельные координаты на указанном уровне масштабирования в координаты проекции (геокоординаты).
                 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IProjection.xml#fromGlobalPixels
                 */
                center = projection.fromGlobalPixels(
                    state.globalPixelCenter, zoom
                ),
                containerSize = map.container.getSize(),
                pixelBounds = [
                    [
                        state.globalPixelCenter[0] - containerSize[0],
                        state.globalPixelCenter[1] - containerSize[1]
                    ],
                    [
                        state.globalPixelCenter[0] + containerSize[0],
                        state.globalPixelCenter[1] + containerSize[1]
                    ]
                ];

            this.state.set({
                mapCenter: center,
                mapBounds: bounds.fromGlobalPixelBounds(pixelBounds, projection, zoom),
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
                mapZoom: e.get('newZoom'),
                mapBounds: e.get('newBounds')
            });
        },
        _onContainerSizeChange: function (e) {

        }
    });

    provide(MapStateInfoWindow);
});
