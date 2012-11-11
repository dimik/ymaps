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
                iconImageHref: 'examples/maps/images/man.png',
                iconImageOffset: [-10, -24],
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
            this.toggleIconImage('examples/maps/images/loader.gif');

            // Делаем кнопку ненажатой
            if(this.isSelected()) {
                this.deselect();
            }

            // Запрашиваем текущие координаты устройства.
            navigator.geolocation.getCurrentPosition(
                this._onGeolocationSuccess.bind(this),
                this._onGeolocationError.bind(this),
                this._options
            );
        },

        /**
         * Обработчик успешного завершения геолокации.
         * @function
         * @private
         * @name GeolocationButton._onGeolocationSuccess
         * @param {Object} position Объект, описывающий текущее местоположение.
         */
        _onGeolocationSuccess: function (position) {
            var coords = position.coords,
                location = [coords.latitude, coords.longitude],
                map = this.getMap(),
                options = this._options;

            // Меняем иконку кнопки обратно
            this.toggleIconImage('examples/maps/images/wifi.png');

            // Смена центра карты (если нужно)
            if(!options.noCentering) {
                map.setCenter(location, 15);
            }

            // Установка метки по координатам местоположения (если нужно).
            if(!options.noPlacemark) {
                this.showGeolocationIcon(location);
            }
        },
        /**
         * Обработчик ошибки геолокации.
         * @function
         * @name GeolocationButton._onGeolocationError
         * @param {Object} error Описание причины ошибки.
         */
        _onGeolocationError: function (error) {
            this.hint
                .show('Точное местоположение определить не удалось.')
                .hide(2000);

            // Меняем иконку кнопки обратно.
            this.toggleIconImage('examples/maps/images/wifi.png');

            if(console) {
                console.warn('GeolocationError: ' + GeolocationButton.ERRORS[error.code - 1]);
            }
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
         * @name GeolocationButton.showGeolocationIcon
         * @param {Number[]} location Координаты точки.
         */
        showGeolocationIcon: function (location) {
            var placemark = this._placemark,
                map = this.getMap();

            // Удаляем старую метку.
            placemark && map.geoObjects.remove(placemark);
            this._placemark = placemark = new ymaps.Placemark(location, {}, { preset: 'geolocation#icon' });
            map.geoObjects.add(placemark);

            // Показываем адрес местоположения в хинте метки.
            this.getAddress(location, function (err, address) {
                if (err) {
                    console.warn(err.toString());
                }
                else {
                    address && placemark.properties.set('hintContent', address);
                }
            });
        },
        /**
         * Получение адреса по координатам.
         * @function
         * @name GeolocationButton.getAddress
         * @param {Number[]} point Координаты точки.
         * @param {Function} callback Функция обратного вызова.
         */
        getAddress: function (point, callback) {
            ymaps.geocode(point).then(function (res) {
                callback(null, res.geoObjects.get(0).properties.get('name'));
            },
            function (err) {
                callback(err);
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

