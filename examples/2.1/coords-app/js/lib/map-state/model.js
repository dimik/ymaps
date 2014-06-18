ymaps.modules.define('mapstate-model', [
    'inherit',
    'ymaps-map',
    'data.Manager'
], function (provide, inherit, map, DataManager) {

var MapStateModel = inherit({
    __constructor: function () {
        this.state = new DataManager();
        this._intervalId = null;
        this._updateTimeout = 10;
        this._setupListeners();
    },
    _setupListeners: function () {
        var listeners = this._listeners = map.events.group();

        listeners
            .add('boundschange', this._onMapBoundsChange, this)
            .add('actiontick', this._onMapAction, this)
            .add('actionbegin', this._onMapActionBegin, this)
            .add('actionend', this._onMapActionEnd, this);
    },
    _clearListeners: function () {
        this._listeners
            .removeAll();
    },
    _getMapState: function () {
        return {
            center: map.getCenter(),
            zoom: map.getZoom()
        };
    },
    /**
     * Обработчик начала плавного движения карты.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml#event-actionbegin
     * @function
     * @private
     * @name MapStateModel._onMapActionBegin
     * @param {ymaps.Event} e Объект-событие
     */
    _onMapActionBegin: function (e) {
        if(this._intervalId) {
            return;
        }

        this._intervalId = window.setInterval(
            ymaps.util.bind(this._onMapAction, this),
            this._updateTimeout
        );
    },
    /**
     * Обработчик окончания плавного движения карты.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml#event-actionend
     * @function
     * @private
     * @name MapStateModel._onMapActionEnd
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
     * @name MapStateModel._onMapAction
     * @param {ymaps.Event} e Объект-событие
     */
    _onMapAction: function (e) {
        /**
         * Определяет состояние карты в момент ее плавного движения.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/map.action.Manager.xml#getCurrentState
         */
        var state = map.action.getCurrentState(),
            zoom = state.zoom,
            /**
             * Преобразует пиксельные координаты на указанном уровне масштабирования в координаты проекции (геокоординаты).
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IProjection.xml#fromGlobalPixels
             */
            center = map.options.get('projection').fromGlobalPixels(
                state.globalPixelCenter, zoom
            );

        this.state.set({
            center: center,
            zoom: zoom
        });
    },
    /**
     * Обработчик события изменения области просмотра карты (в результате изменения центра или уровня масштабирования)
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Map.xml#event-boundschange
     * @function
     * @private
     * @name MapStateModel._onMapBoundsChange
     * @param {ymaps.Event} e Объект-событие
     */
    _onMapBoundsChange: function (e) {
        this.state.set({
            center: e.get('newCenter'),
            zoom: e.get('newZoom')
        });
    }
});

provide(MapStateModel);

});
