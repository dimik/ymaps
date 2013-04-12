/**
 * Класс Инструмент определения координат.
 * @class
 * @name LocationTool
 * @param {ymaps.Map} map Карта.
 */
function LocationTool(map) {
    this._domView = new LocationTool.DOMView();
    this._mapView = new LocationTool.MapView(map);
    this._monitor = new ymaps.Monitor(this._mapView.state);
    this._setupMonitor();
    this._initDOMView();
}

/**
 * @lends LocationTool.prototype
 */
LocationTool.prototype = {
    /**
     * @constructor
     */
    constructor: LocationTool,
    /**
     * Инициализирует DOMView начальными значениями карты.
     * @private
     * @function
     * @name LocationTool._initView
     */
    _initDOMView: function () {
        this._domView.render(this._mapView.state.getAll());
    },
    /**
     * Настраиваем монитор для наблюдения за интересующими нас полями.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Monitor.xml
     * @private
     * @function
     * @name LocationTool._setupMonitor
     */
    _setupMonitor: function () {
        this._monitor
            .add(['mapCenter', 'mapZoom', 'markerPosition'], this._onMapViewStateChange, this);
    },
    /**
     * Останавливаем наблюдение.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Monitor.xml#removeAll
     * @private
     * @function
     * @name LocationTool._clearMonitor
     */
    _clearMonitor: function () {
        this._monitor
            .removeAll();
    },
    /**
     * Обработчик изменения полей.
     * @private
     * @function
     * @name LocationTool._onMapViewStateChange
     */
    _onMapViewStateChange: function (data) {
        this._domView.render(data);
    }
};

/**
 * Класс отображения на карте Инструмента определения координат.
 * @class
 * @name MapView
 * @param {ymaps.Map} map Карта.
 */
LocationTool.MapView = function (map) {
    this._map = map;
    // Интервал обновления данных (millisec) при кинетическом движении карты.
    this._updateTimeout = 10;
    this._marker = this._createDraggableMarker();
    map.geoObjects.add(this._marker);
    this.state = new ymaps.data.Manager({
        mapCenter: map.getCenter(),
        mapZoom: map.getZoom(),
        markerPosition: map.getCenter()
    });
    this._attachHandlers();
};

/**
 * @lends MapView.prototype
 */
LocationTool.MapView.prototype = {
    /**
     * @constructor
     */
    constructor: LocationTool.MapView,
    /**
     * Навешиваем обработчики.
     * @function
     * @private
     * @name MapView._attachHandlers
     */
    _attachHandlers: function () {
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
     * @name MapView._detachHandlers
     */
    _detachHandlers: function () {
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
            ymaps.util.bind(this._onMapAction, this),
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
        return new ymaps.Placemark(this._map.getCenter(), {
            hintContent: 'Перетащите метку'
        }, {
            draggable: true
        });
    }
};

/**
 * Класс DOM-отображения Инструмента определения координат.
 * @class
 * @name DOMView
 */
LocationTool.DOMView = function () {
    this._element = $($('#positionDataTemplate').text());
    this._container = $('#container');
    this._container
        .append(this._element);
}

/**
 * @lends DOMView.prototype
 */
LocationTool.DOMView.prototype = {
    /**
     * @constructor
     */
    constructor: LocationTool.DOMView,
    /**
     * Отображаем изменений данных в DOM-структуре.
     * @function
     * @name DOMView.render
     * @param {Object} data Объект с полями "mapCenter", "mapZoom" и "markerPosition".
     */
    render: function (data) {
        $.each(data, $.proxy(this._setData, this));
    },
    /**
     * Очистка DOM-отображения.
     * @function
     * @private
     * @name DOMView.clear
     */
    clear: function () {
        this._element.remove();
    },
    /**
     * Форматируем координату до 6-ти точек после запятой.
     * @function
     * @private
     * @name DOMView._toFixedNumber
     * @param {Number|String} coords Широта или Долгота.
     * @returns {Number} Число фиксированной длины.
     */
    _toFixedNumber: function (coords) {
        return Number(coords).toFixed(6);
    },
    /**
     * Обновление значений полей формы.
     * @function
     * @private
     * @name DOMView._setData
     * @param {String} id Идентификатор поля.
     * @param {Number|String} value Новое значение поля.
     */
    _setData: function (id, value) {
        this._element
            .find('#' + id)
            .val(
                $.isArray(value)?
                    $.map(value, this._toFixedNumber).join(', ') : value
            );
    }
};

