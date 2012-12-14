/**
 * @fileOverview
 * Класс для создания ссылки на карту.
 * @example
 * @see http://dimik.github.com/ymaps/examples/map-location/#center=55.74009108312381,37.6006885988358&zoom=10&type=yandex%23map
 */

/**
 * Класс для создания ссылки на карту.
 * @class
 * @name MapLocation
 * @param {ymaps.Map} map Экземпляр карты.
 * @param {MapLocationState} state Объект-состояние карты.
 */
function MapLocation(map, state) {
    this._map = map;
    this._state = state;
    this._silent = false;

    map.events.add(['boundschange', 'typechange'], this._onStateChange, this);
}

/**
 * @private
 * @function
 */
MapLocation.prototype._onStateChange = function (e) {
    var oldState = this._state;

    if(this._silent) {
        this._silent = false;
    }
    else {
        /**
         * @event
         * @name ymaps.Map#locationstatechange
         * @param {MapLocationState} oldState Предыдущее состояние карты.
         * @param {MapLocationState} newState Актуальное состояние карты.
         */
        this._map.events.fire('locationstatechange', {
            oldState: oldState,
            newState: (this._state = new MapLocationState({
                center: (e.get('newCenter') || oldState.get('center')).map(MapLocationState.toCoords),
                zoom: e.get('newZoom') >= 0 ? e.get('newZoom') : oldState.get('zoom'),
                type: e.get('newType') || oldState.get('type')
            }))
        });
    }
};

/**
 * Получение состояния карты.
 * @function
 * @name MapLocation.getState
 * @returns {MapLocationState} Состояние карты.
 */
MapLocation.prototype.getState = function () {
    return this._state;
};

/**
 * Выставить состояние карты.
 * @function
 * @name MapLocation.setState
 * @param {Object} data Данные состояния.
 * @returns {MapLocation} Экземпляр класса для чайнинга.
 */
MapLocation.prototype.setState = function (data) {
    var map = this._map,
        state = this._state;

    this._silent = true;

    if(data.type === state.get('type')) {
        map.setCenter(data.center, data.zoom);
        state
            .set('center', data.center)
            .set('zoom', data.zoom);
    }
    else {
        map.setType(data.type);
        state.set('type', data.type);
    }

    return this;
};

/**
 * Класс состояния карты.
 * @class
 * @name MapLocationState
 * @param {Object} data Данные состояния.
 */
function MapLocationState(data) {
    this._data = data;
}

/**
 * Геттер состояния.
 * @function
 * @name MapLocationState.get
 * @param {String} param Имя поля состояния.
 */
MapLocationState.prototype.get = function (param) {
    return this._data[param];
};

/**
 * Сеттер состояния.
 * @function
 * @name MapLocationState.set
 * @param {String} param Имя поля.
 * @param {String|Number|Number[]} value Значение поля.
 * @returns {MapLocationState} Экземпляр класса для чайнинга.
 */
MapLocationState.prototype.set = function (param, value) {
    if(value != null) {
        this._data[param] = value;
    }

    return this;
};

/**
 * Получение всех данных состояния.
 * @function
 * @name MapLocationState.getData
 * @returns {Object} Данные состояния.
 */
MapLocationState.prototype.getData = function () {
    return this._data;
};

/**
 * @function
 * @name MapLocationState.toString
 * @returns {String} Строковое представление состояния карты.
 */
MapLocationState.prototype.toString = function () {
    var data = this._data,
        params = [];

    for(var param in data) {
        params.push(encodeURI(param) + '=' + encodeURIComponent(data[param]));
    }

    return params.join('&');
};

/**
 * Парсер строки запроса.
 * @static
 * @function
 * @name MapLocationState.fromString
 * @param {String} location Урл параметры карты.
 * @returns {MapLocationState} Экземпляр класса состояния.
 */
MapLocationState.fromString = function (location) {
    var params = {};

    location.replace(/[^?&#]+(?=&|$)/g, function (s) {
        var param = s.split('=');

        params[decodeURI(param[0])] = decodeURIComponent(param[1]);
    });

    return new MapLocationState({
        center: params.center.split(',').map(MapLocationState.toCoords),
        zoom: Number(params.zoom),
        type: params.type || 'yandex#map'
    });
};

/**
 * Преобразование координат к числу фиксированной длины.
 * @static
 * @function
 * @name MapLocationState.toCoors
 * @param {String|Number} i
 * @returns {Number} Число с 6-ю цифрами поле точки.
 */
MapLocationState.toCoords = function (i) {
    return Number(i).toFixed(6);
};
