/**
 * Класс сервиса геолокации.
 * Определяет местоположение с использованием Geolocation API браузера.
 * В случае его отсутствия или ошибки определяет местоположение по IP с помощью API Яндекс.Карт.
 * @see http://www.w3.org/TR/geolocation-API/
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/geolocation.xml
 * @class
 * @name GeolocationService
 * @param {Number[]} mapSize Размер контейнера карты для расчета масштаба.
 */
function GeolocationService(mapSize) {
    this._mapSize = mapSize;
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
     * Обработчик результата геолокации.
     * @private
     * @function
     * @name GeolocationService._onGeolocationSuccess
     * @param {Object} position Объект с описанием местоположения.
     * @see http://www.w3.org/TR/geolocation-API/#position_interface
     */
    _onGeolocationSuccess: function (position) {
        var coords = [position.coords.latitude, position.coords.longitude],
            mapSize = this._mapSize,
            location = this._location,
            positionData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                speed: position.coords.speed,
                heading: position.coords.heading
            };

        this.getLocationData(coords)
            .then(
                function (res) {
                    var result = res.geoObjects.get(0);

                    if(result) {
                        location.resolve(
                            ymaps.util.extend({}, positionData, {
                                zoom: ymaps.util.bounds.getCenterAndZoom(result.properties.get('boundedBy'), mapSize, ymaps.projection.wgs84Mercator).zoom,
                                city: result.properties.get('metaDataProperty.GeocoderMetaData.AddressDetails.Country.Locality.LocalityName',
                                    result.properties.get('name')
                                ),
                                country: result.properties.get('metaDataProperty.GeocoderMetaData.AddressDetails.Country.CountryName',
                                    result.properties.get('description')
                                ),
                                region: result.properties.get('metaDataProperty.GeocoderMetaData.AddressDetails.Country.AdministrativeArea.AdministrativeAreaName',
                                    result.properties.get('metaDataProperty.GeocoderMetaData.text')
                                ),
                                isHighAccuracy: true
                            })
                        );
                    }
                    else {
                        location.resolve(
                            ymaps.util.extend({}, ymaps.geolocation, positionData, {
                                isHighAccuracy: true
                            })
                        );
                    }
                },
                function (err) {
                    location.resolve(
                        ymaps.util.extend({}, ymaps.geolocation, positionData, {
                            isHighAccuracy: true
                        })
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
        // Выводим в консоль описание ошибки.
        if(window.console) {
            console.log(error.message || this.constructor.GEOLOCATION_ERRORS[error + 1]);
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
        return ymaps.geocode(coords, {
            results: 1,
            kind: 'locality'
        });
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
