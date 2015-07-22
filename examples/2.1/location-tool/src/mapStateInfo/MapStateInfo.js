ym.modules.define('MapStateInfo', [
    'util.defineClass',
    'util.extend',
    'util.bind',
    'util.bounds',
    'data.Manager',
    'event.Manager',
    'Monitor',
    'control.MapStateInfoButton',
    'control.MapStateInfoWindow',
    'control.CrossControl',
    'control.DraggablePlacemark'
], function (
    provide,
    defineClass,
    extend,
    bind,
    bounds,
    DataManager,
    EventManager,
    Monitor,
    MapStateInfoButton,
    MapStateInfoWindow,
    CrossControl,
    DraggablePlacemark
) {
    var MapStateInfo = defineClass(function (map) {
        this._map = map;
        this._mapEvents = map.events.group();

        this.events = new EventManager();

        this.state = new DataManager();

        this._updateTimeout = 30;
        this._intervalId = null;

        this._windowControl = new MapStateInfoWindow();
        this._crossControl = new CrossControl();
        this._markerControl = new DraggablePlacemark();
        this._stateMonitor = new Monitor(this._markerControl.state);
        this._buttonControl = new MapStateInfoButton();
        map.controls.add(this._buttonControl);
        this._buttonControl.events
            .add('select', this._onButtonSelect, this)
            .add('deselect', this._onButtonDeselect, this);
        this._buttonControl.select();
    }, {
        getMap: function () {
            return this._map;
        },
        _setupListeners: function () {
            this._mapEvents
                .add('boundschange', this._onMapBoundsChange, this)
                .add('actiontick', this._onMapAction, this)
                /* Во время плавного движения карты, у браузеров поддерживающих CSS3 Transition,
                 * actiontick не кидается, поэтому используем этот прием через setInterval.
                 */
                .add('actionbegin', this._onMapActionBegin, this)
                .add('actionend', this._onMapActionEnd, this);
            this._map.controls.get('searchControl').events.add('resultshow', this._onSearchControlResult, this);
            this.state.events.add('change', this._onStateChange, this);
        },
        _clearListeners: function () {
            this.state.events.remove('change', this._onStateChange, this);
            this._map.controls.get('searchControl').events.remove('resultshow', this._onSearchControlResult, this);
            this._mapEvents.removeAll();
        },
        _setupMonitor: function () {
            this._stateMonitor
                .add('markerCenter', this._onMarkerMove, this);
        },
        _clearMonitor: function () {
            this._stateMonitor
                .removeAll();
        },
        _onSearchControlResult: function () {
            this._markerControl.moveToMapCenter();
        },
        _onButtonSelect: function () {
            this._map.controls
                .add(this._windowControl, { position: { bottom: 190, right: 230 }})
                .add(this._crossControl)
                .add(this._markerControl);

            this._setupListeners();
            this._setupMonitor();
            this.state.set(this._getInitialState());
        },
        _onButtonDeselect: function () {
            this._map.controls
                .remove(this._windowControl)
                .remove(this._crossControl)
                .remove(this._markerControl);

            this._clearListeners();
            this._clearMonitor();
        },
        _getInitialState: function () {
            var map = this.getMap();

            return {
                mapCenter: map.getCenter(),
                mapZoom: map.getZoom(),
                mapBounds: map.getBounds(),
                markerCenter: map.getCenter()
            };
        },
        _onMarkerMove: function (newCenter) {
            this.state.set('markerCenter', newCenter);
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
                        state.globalPixelCenter[0] - containerSize[0] / 2,
                        state.globalPixelCenter[1] - containerSize[1] / 2
                    ],
                    [
                        state.globalPixelCenter[0] + containerSize[0] / 2,
                        state.globalPixelCenter[1] + containerSize[1] / 2
                    ]
                ];

            this.state.set({
                mapCenter: center,
                mapBounds: bounds.fromGlobalPixelBounds(pixelBounds, zoom, projection),
                mapZoom: zoom,
                markerCenter: this._getMarkerCoordinates()
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
                mapBounds: e.get('newBounds'),
                markerCenter: this._getMarkerCoordinates()
            });
        },
        _getMarkerCoordinates: function () {
            var map = this.getMap(),
                zoom = map.getZoom(),
                position = this._markerControl.getPosition();

            return map.options.get('projection').fromGlobalPixels(
                map.converter.pageToGlobal(position, zoom),
                zoom
            );
        },
        _onStateChange: function () {
            this.events.fire('statechange', extend({ target: this }, this.state.getAll()));
            this._windowControl.data.set(this.state.getAll());
        }
    });

    provide(MapStateInfo);
});
