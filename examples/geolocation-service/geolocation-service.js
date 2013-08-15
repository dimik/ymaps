/**
 * Класс сервиса геолокации.
 * Определяет местоположение с использованием Geolocation API браузера.
 * В случае его отсутствия или ошибки определяет местоположение по IP с помощью API Яндекс.Карт.
 * @see http://www.w3.org/TR/geolocation-API/
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/geolocation.xml
 * @class
 * @name GeolocationService
 */
function GeolocationService() {
    this._location = new ymaps.util.Promise();
};

/**
 * @lends GeolocationService.prototype
 */
GeolocationService.prototype = {
    /**
     * @constructor
     */
    constructor: GeolocationService,
    /**
     * Определяем местоположение пользователя всеми доступными средствами.
     * @function
     * @name GeolocationService.getLocation
     * @params {Object} [options] Опции GeolocationAPI
     * @see http://www.w3.org/TR/geolocation-API/#position-options
     * @returns {ymaps.util.Promise} Возвращает объект-обещание.
     */
    getLocation: function (options) {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                ymaps.util.bind(this._onGeolocationSuccess, this),
                ymaps.util.bind(this._onGeolocationError, this),
                options
            );
        }
        else {
            this._location.resolve(
                this.getLocationByIP() || this.getDefaults()
            );
        }

        return this._sync();
    },
    /**
     * Обертка над оригинальным промисом, чтобы его нельзя было зареджектить
     * из пользовательского кода.
     * @private
     * @function
     * @name GeolocationService._sync
     * @returns {ymaps.util.Promise} Промис-обертка.
     */
    _sync: function (p) {
        var promise = new ymaps.util.Promise();

        this._location.then(
            function (res) { promise.resolve(res); },
            function (err) { promise.reject(err); }
        );

        return promise;
    },
    /**
     * Перегружаем промис для обновления местоположения при повторных вызовах getLocation.
     * @private
     * @function
     * @name GeolocationService._reset
     */
    _reset: function () {
        this._location = new ymaps.util.Promise();
    },
    /**
     * Обработчик результата геолокации.
     * @private
     * @function
     * @name GeolocationService._onGeolocationSuccess
     * @param {Object} position Объект с описанием местоположения.
     * @see http://www.w3.org/TR/geolocation-API/#position_interface
     */
    _onGeolocationSuccess: function (position) {
        this._location.resolve(position.coords);

        this._reset();
    },
    /**
     * Обработчик ошибки геолокации.
     * @private
     * @function
     * @name GeolocationService._onGeolocationError
     * @param {Object|Number} error Объект или код ошибки.
     * @see http://www.w3.org/TR/geolocation-API/#position_error_interface
     */
    _onGeolocationError: function (error) {
        // Выводим в консоль описание ошибки.
        if(window.console) {
            console.log(error.message || this.constructor.GEOLOCATION_ERRORS[error + 1]);
        }

        this._location.resolve(
            this.getLocationByIP() || this.getDefaults()
        );

        this._reset();
    },
    /**
     * Возвращает данные о местоположении пользователя на основе его IP-адреса.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/geolocation.xml
     * @function
     * @name GeolocationService.getLocationByIP
     * @returns {Object|null} Местоположение пользователя.
     */
    getLocationByIP: function () {
        return ymaps.geolocation;
    },
    /**
     * Возвращает местоположение по умолчанию.
     * Удобно для перекрытия.
     * @function
     * @name GeolocationService.getDefaults
     * @returns {Object} Местоположение пользователя.
     */
    getDefaults: function () {
        // По умолчанию возвращаем Москву.
        return {
            latitude: 55.751574,
            longitude: 37.573856,
            zoom: 9
        };
    }
};

/**
 * Человекопонятное описание кодов ошибок Geolocation API.
 * @see http://www.w3.org/TR/geolocation-API/#position_error_interface
 * @static
 */
GeolocationService.GEOLOCATION_ERRORS = [
    'permission denied',
    'position unavailable',
    'timeout'
];
