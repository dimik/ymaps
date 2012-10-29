/**
 * Класс кнопки определения местоположения пользователя
 * с помощью Geolocation API броузера.
 * @see http://www.w3.org/TR/geolocation-API/
 * @class
 * @name GeolocationButton
 * @param {Object} params Данные для кнопки и параметры к Geolocation API.
 */
function GeolocationButton(params) {
    GeolocationButton.superclass.constructor.call(this, params);

    // Расширяем дефолтные опции теми что передали в конструкторе
    this._options = ymaps.util.extend({
        noCentering : false,            // Не центрировать карту
        noPlacemark : false,            // Не ставить метку
        enableHighAccuracy : false,     // Режим получения наиболее точных данных
        timeout : 10000,                // Максиальное время ожидания ответа (в милисекундах)
        maximumAge : 1000               // Максимальное время жизни полученных данных (в милисекундах)
    }, params.options);

    this._storage = ymaps.option.presetStorage;

    // Browser Geolocation API
    this.service = navigator.geolocation;
}

// Обернем вызов ymaps.util.augment в ymaps.ready, т.к. нужно дождаться пока АПИ загрузится.
ymaps.ready(function () {
    ymaps.util.augment(GeolocationButton, ymaps.control.Button, {
        /**
         * Метод будет вызван при добавлении кнопки на карту.
         * @function
         * @name GeolocationButton.onAddToMap
         * @param {ymaps.Map} map Карта на которую добавляется кнопка.
         */
        onAddToMap : function () {
            GeolocationButton.superclass.constructor.prototype.onAddToMap.apply(this, arguments);

            this._storage.add('geolocation#icon', {
                iconImageHref : 'man.png',
                iconImageOffset : [-10, -24],
                iconImageSize : [27, 26]
            });

            // Чтобы определить позицию контрола нужно дождаться события его добавления у родителя.
            this.getParent().events.add('add', this._onAddToParent, this);
            // Обрабатываем клик на кнопке.
            this.events.add('click', this._onBtnClick, this);
        },
        /**
         * Метод будет вызван при удалении кнопки с карты.
         * @function
         * @name GeolocationButton.onRemoveFromMap
         * @param {ymaps.Map} map Карта с которой удаляется кнопка.
         */
        onRemoveFromMap : function () {
            GeolocationButton.superclass.constructor.prototype.onRemoveFromMap.apply(this, arguments);

            this.events.remove('click', this._onBtnClick, this);
            this.getParent().events.remove('add', this._onAddToParent, this);
            this._storage.remove('geolocation#icon');
        },
        /**
         * Обработчик клика на кнопке.
         * @function
         * @private
         * @name GeolocationButton._onBtnClick
         * @param {ymaps.Event} e Объект события.
         */
        _onBtnClick : function (e) {
            this.toggleIconImage('loader.gif'); // Меняем иконку кнопки на прелоадер
            this.isSelected() && this.deselect(); // Делаем кнопку ненажатой

            // Запрашиваем текущие координаты местоположения
            this.service.getCurrentPosition(
                this._onGeolocationSuccess.bind(this),
                this._onGeolocationError.bind(this),
                this._options
            );
        },
        /**
         * Обработчик добавления кнопки в родительский контейнер конролов.
         * @function
         * @private
         * @name GeolocationButton._onAddToParent
         * @param {Object} e Объект события.
         */
        _onAddToParent : function (e) {
            if(this === e.get('child')) {
                this.hint = new GeolocationButtonHint(this);
            }
        },
        /**
         * Обработчик успешного завершения геолокации.
         * @function
         * @private
         * @name GeolocationButton._onGeolocationSuccess
         * @param {Object} position Объект описывающий текущее местоположение.
         */
        _onGeolocationSuccess : function (position) {
            var coords = position.coords,
                location = [coords.latitude, coords.longitude],
                map = this.getMap(),
                options = this._options;

            this.toggleIconImage('wifi.png'); // Меняем иконку кнопки обратно

            options.noCentering || map.setCenter(location, 15); // Смена центра карты (если нужно)

            // Установка метки по координатам местоположения (если нужно)
            options.noPlacemark || this.showGeolocationIcon(location);
        },
        /**
         * Обработчик ошибки геолокации.
         * @function
         * @name GeolocationButton._onGeolocationError
         * @param {Object} error Описание причины ошибки.
         */
        _onGeolocationError : function (error) {
            this.hint
                .show('Точное местоположение определить не удалось.')
                .hide(2000);

            this.toggleIconImage('wifi.png'); // Меняем иконку кнопки обратно

            console.warn('GeolocationError: ' + GeolocationButton.Errors[error.code - 1]);
        },
        /**
         * Меняет иконку кнопки.
         * @function
         * @name GeolocationButton.toggleIconImage
         * @param {String} image Путь до изображения.
         */
        toggleIconImage : function (image) {
            this.data.set('image', image);
        },
        /**
         * Отображение метки по координатам.
         * @function
         * @name GeolocationButton.showGeolocationIcon
         * @param {Number[]} location Координаты точки.
         */
        showGeolocationIcon : function (location) {
            var placemark = this._placemark,
                map = this.getMap();

            placemark && map.geoObjects.remove(placemark); // Удаляем старую метку
            this._placemark = placemark = new ymaps.Placemark(location, {}, { preset : 'geolocation#icon' });
            map.geoObjects.add(placemark);

            // Показываем адрес местоположения в хинте метки
            this.getAddress(location, function (err, address) {
                if(err) {
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
        getAddress : function (point, callback) {
            ymaps.geocode(point).then(function (res) {
                callback(null, res.geoObjects.get(0).properties.get('name'));
            },
            function (err) {
                callback(err);
            });
        },
    });
});

/**
 * Человекопонятное описание кодов ошибок.
 * @static
 */
GeolocationButton.Errors = [
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
        position = btn.options.get('position'); // Позиция контрола

    this._map = map;
    this._position = [ position.left + 35, position.top ]; // Отодвинем от кнопки на 35px
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

    map.hint.show(position, text);

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
    var map = this._map;

    setTimeout(function () {
        map.hint.hide();
    }, timeout);

    return this;
};

