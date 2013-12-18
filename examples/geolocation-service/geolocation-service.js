/**
 * Класс сервиса геолокации.
 * Определяет местоположение с использованием Geolocation API браузера.
 * В случае его отсутствия или ошибки определяет местоположение по IP с помощью API Яндекс.Карт.
 * @class
 * @name GeolocationService
 * @see http://www.w3.org/TR/geolocation-API/
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/geolocation.xml
 */
function GeolocationService() {
    this._location = new ymaps.util.Promise();
    this._timeoutId = null;
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
            this._cleanUp();
        }
        else {
            this._location.resolve(
                this.getLocationByIP() || this.getDefaults()
            );
        }

        return this._sync();
    },
    _cleanUp: function () {
        // this._timeoutId = setTimeout(ymaps.util.bind(this._onGeolocationError, this, 2), 30000);
        this._timeoutId = setTimeout($.proxy(this._onGeolocationError, this, 3), 30000);
    },
    _clearTimeout: function () {
        if(this._timeoutId) {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }
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
     * Обработчик результата геолокации.
     * @private
     * @function
     * @name GeolocationService._onGeolocationSuccess
     * @param {Object} position Объект с описанием местоположения.
     * @see http://www.w3.org/TR/geolocation-API/#position_interface
     */
    _onGeolocationSuccess: function (position) {
        var coords = [position.coords.latitude, position.coords.longitude],
            location = this._location,
            locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                speed: position.coords.speed,
                heading: position.coords.heading
            };

        this._clearTimeout();

        this.getLocationData(coords)
            .then(
                function (data) {
                    location.resolve(
                        ymaps.util.extend({ isHighAccuracy: true }, locationData, data)
                    );
                },
                function (err) {
                    location.resolve(
                        ymaps.util.extend({}, ymaps.geolocation, locationData, { isHighAccuracy: true })
                    );
                }
            );
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
        this._clearTimeout();

        // Выводим в консоль описание ошибки.
        if(window.console) {
            console.log(error.message || this.constructor.GEOLOCATION_ERRORS[(error.code || error) - 1]);
        }

        this._location.resolve(
            this.getLocationByIP() || this.getDefaults()
        );
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
     * Осуществляет обратное геокодирование местоположения пользователя.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/geolocation.xml
     * @function
     * @name GeolocationService.getLocationData
     * @param {Number[]} coords Координаты местоположения.
     * @returns {ymaps.util.Promise} Промис-обертка.
     */
    getLocationData: function (coords) {
        var promise = new ymaps.util.Promise(),
            mapSize = this.getMapSize(),
            search = ymaps.geocode(coords, {
                results: 1,
                kind: 'locality'
            });

        search.then(
            function (res) {
                var result = res.geoObjects.get(0),
                    props = result.properties;

                if(result) {
                    promise.resolve({
                        zoom: ymaps.util.bounds.getCenterAndZoom(props.get('boundedBy'), mapSize, ymaps.projection.wgs84Mercator).zoom,
                        city: props.get('metaDataProperty.GeocoderMetaData.AddressDetails.Country.Locality.LocalityName',
                            props.get('name')
                        ),
                        country: props.get('metaDataProperty.GeocoderMetaData.AddressDetails.Country.CountryName',
                            props.get('description')
                        ),
                        region: props.get('metaDataProperty.GeocoderMetaData.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName',
                            props.get('metaDataProperty.GeocoderMetaData.text')
                        )
                    });
                }
                else {
                    promise.reject('Not found');
                }
            },
            function (err) {
                promise.reject(err);
            }
        );

        return promise;
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
            zoom: 9,
            city: "Москва",
            country: "Россия",
            region: "Москва и Московская область",
            isHighAccuracy: false
        };
    },
    /**
     * Перекрытие.
     * Возвращает размер контейнера карты.
     * @function
     * @name GeolocationService.getMapSize
     * @returns {Number[]} Размер контейнера карты.
     */
    getMapSize: function () {
        return [ 800, 600 ];
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
