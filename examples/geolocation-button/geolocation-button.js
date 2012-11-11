/**
 * Класс кнопки определения местоположения пользователя.
 * с помощью Geolocation API.
 * @see http://www.w3.org/TR/geolocation-API/
 * @class
 * @name GeolocationButton
 * @param {Object} params Данные для кнопки и параметры к Geolocation API.
 */
function GeolocationButton(params) {
    GeolocationButton.superclass.constructor.call(this, params);

    // Расширяем опции по умолчанию теми, что передали в конструкторе.
    this._options = ymaps.util.extend({
        // Не центрировать карту.
        noCentering: false,
        // Не ставить метку.
        noPlacemark: false,
        // Не показывать точность определения местоположения.
        noAccuracy: false,
        // Режим получения наиболее точных данных.
        enableHighAccuracy: false,
        // Максимальное время ожидания ответа (в миллисекундах).
        timeout: 10000,
        // Максимальное время жизни полученных данных (в миллисекундах).
        maximumAge: 1000
    }, params.options);
}

ymaps.ready(function () {
    ymaps.util.augment(GeolocationButton, ymaps.control.Button, {
        /**
         * Метод будет вызван при добавлении кнопки на карту.
         * @function
         * @name GeolocationButton.onAddToMap
         * @param {ymaps.Map} map Карта на которую добавляется кнопка.
         */
        onAddToMap: function () {
            GeolocationButton.superclass.onAddToMap.apply(this, arguments);

            ymaps.option.presetStorage.add('geolocation#icon', {
                iconImageHref: 'man.png',
                iconImageOffset: [-10, -26],
                iconImageSize: [27, 26]
            });

            this.hint = new GeolocationButtonHint(this);
            // Обрабатываем клик на кнопке.
            this.events.add('click', this._onBtnClick, this);
        },
        /**
         * Метод будет вызван при удалении кнопки с карты.
         * @function
         * @name GeolocationButton.onRemoveFromMap
         * @param {ymaps.Map} map Карта с которой удаляется кнопка.
         */
        onRemoveFromMap: function () {
            this.events.remove('click', this._onBtnClick, this);
            this.hint = null;
            ymaps.option.presetStorage.remove('geolocation#icon');

            GeolocationButton.superclass.onRemoveFromMap.apply(this, arguments);
        },
        /**
         * Обработчик клика на кнопке.
         * @function
         * @private
         * @name GeolocationButton._onBtnClick
         * @param {ymaps.Event} e Объект события.
         */
        _onBtnClick: function (e) {
            // Меняем иконку кнопки на прелоадер.
            this.toggleIconImage('loader.gif');

            // Делаем кнопку ненажатой
            if(this.isSelected()) {
                this.deselect();
            }

            if(navigator.geolocation) {
                // Запрашиваем текущие координаты устройства.
                navigator.geolocation.getCurrentPosition(
                    this._onGeolocationSuccess.bind(this),
                    this._onGeolocationError.bind(this),
                    this._options
                );
            }
            else {
                this.handleGeolocationError('Ваш броузер не поддерживает GeolocationAPI.');
            }
        },

        /**
         * Обработчик успешного завершения геолокации.
         * @function
         * @private
         * @name GeolocationButton._onGeolocationSuccess
         * @param {Object} position Объект, описывающий текущее местоположение.
         */
        _onGeolocationSuccess: function (position) {
            this.handleGeolocationResult(position);
            // Меняем иконку кнопки обратно
            this.toggleIconImage('wifi.png');
        },
        /**
         * Обработчик ошибки геолокации.
         * @function
         * @name GeolocationButton._onGeolocationError
         * @param {Object} error Описание причины ошибки.
         */
        _onGeolocationError: function (error) {
            this.handleGeolocationError('Точное местоположение определить не удалось.');
            // Меняем иконку кнопки обратно.
            this.toggleIconImage('wifi.png');

            if(console) {
                console.warn('GeolocationError: ' + GeolocationButton.ERRORS[error.code - 1]);
            }
        },
        /**
         * Выводим ошибки в хинт.
         * @function
         * @name GeolocationButton.handleGeolocationError
         * @param {Object} err Описание причины ошибки.
         */
        handleGeolocationError: function (err) {
            this.hint
                .show(err)
                .hide(2000);
        },
        /**
         * Меняет иконку кнопки.
         * @function
         * @name GeolocationButton.toggleIconImage
         * @param {String} image Путь до изображения.
         */
        toggleIconImage: function (image) {
            this.data.set('image', image);
        },
        /**
         * Отображение метки по координатам.
         * @function
         * @name GeolocationButton.showGeolocationResult
         * @param {Object} position Результат геолокации.
         */
        handleGeolocationResult: function (position) {
            var location = [position.coords.latitude, position.coords.longitude],
                accuracy = position.coords.accuracy,
                map = this.getMap(),
                options = this._options,
                placemark = this._placemark,
                circle = this._circle;

            // Смена центра карты (если нужно)
            if(!options.noCentering) {
                map.setCenter(location, 15);
            }

            // Установка метки по координатам местоположения (если нужно).
            if(!options.noPlacemark) {
                // Удаляем старую метку.
                if(placemark) {
                    map.geoObjects.remove(placemark);
                }
                this._placemark = placemark = new ymaps.Placemark(location, {}, { preset: 'geolocation#icon' });
                map.geoObjects.add(placemark);
                // Показываем адрес местоположения в хинте метки.
                this.getLocationInfo(placemark);
            }

            // Показываем точность определения местоположения (если нужно).
            if(!options.noAccuracy) {
                // Удаляем старую точность.
                if(circle) {
                    map.geoObjects.remove(circle);
                }
                this._circle = circle = new ymaps.Circle([location, accuracy], {}, { opacity: 0.5 });
                map.geoObjects.add(circle);
            }
        },
        /**
         * Получение адреса по координатам метки.
         * @function
         * @name GeolocationButton.getLocationInfo
         * @param {ymaps.Placemark} point Метка для которой ищем адрес.
         */
        getLocationInfo: function (point) {
            ymaps.geocode(point.geometry.getCoordinates())
                .then(function (res) {
                    var result = res.geoObjects.get(0);

                    if(result) {
                        point.properties.set('hintContent', result.properties.get('name'));
                    }
                });
        }
    });
});

/**
 * Человекопонятное описание кодов ошибок.
 * @static
 */
GeolocationButton.ERRORS = [
    'permission denied',
    'position unavailable',
    'timeout'
];

/**
 * Класс хинта кнопки геолокации, будем использовать для отображения ошибок.
 * @class
 * @name GeolocationButtonHint
 * @param {GeolocationButton} btn Экземпляр класса кнопки.
 */
function GeolocationButtonHint(btn) {
    var map = btn.getMap(),
        // Позиция кнопки.
        position = btn.options.get('position');

    this._map = map;
    // Отодвинем от кнопки на 35px.
    this._position = [position.left + 35, position.top];
}
/**
 * Отображает хинт справа от кнопки.
 * @function
 * @name GeolocationButtonHint.show
 * @param {String} text
 * @returns {GeolocationButtonHint}
 */
GeolocationButtonHint.prototype.show = function (text) {
    var map = this._map,
        globalPixels = map.converter.pageToGlobal(this._position),
        position = map.options.get('projection').fromGlobalPixels(globalPixels, map.getZoom());

    this._hint = map.hint.show(position, text);

    return this;
};
/**
 * Прячет хинт с нужной задержкой.
 * @function
 * @name GeolocationButtonHint.hide
 * @param {Number} timeout Задержка в миллисекундах.
 * @returns {GeolocationButtonHint}
 */
GeolocationButtonHint.prototype.hide = function (timeout) {
    var hint = this._hint;

    if(hint) {
        setTimeout(function () {
            hint.hide();
        }, timeout);
    }

    return this;
};

