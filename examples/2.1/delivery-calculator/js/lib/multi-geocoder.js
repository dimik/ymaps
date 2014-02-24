define(['ready!ymaps', 'module'], function (ymaps, module) {

var config = module.config;

/**
 * @fileOverview
 * Пример реализации функциональности множественного геокодирования.
 * Аналогичная разработка для первой версии АПИ.
 * @see http://api.yandex.ru/maps/doc/jsapi/1.x/examples/multiplygeocoding.html
 * @example
 * var multiGeocoder = new MultiGeocoder({ boundedBy : map.getBounds() });
 * multiGeocoder
 *     .geocode(['Москва, Льва Толстого 16', [55.7, 37.5], 'Санкт-Петербург'])
 *         .then(
 *             function (res) {
 *                 map.geoObjects.add(res.geoObjects);
 *             },
 *             function (err) {
 *                 console.log(err);
 *             }
 *         );
 */

/**
 * Класс для геокодирования списка адресов или координат.
 * @class
 * @name MultiGeocoder
 * @param {Object} [options={}] Дефолтные опции мультигеокодера.
 */
function MultiGeocoder(options) {
    this._options = ymaps.util.extend({}, config, options);
}

/**
 * Функция множественнеого геокодирования.
 * @function
 * @requires ymaps.util.extend
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/util.extend.xml
 * @requires ymaps.vow.Promise
 * @see http://api.yandex.ru/maps/doc/jsapi/beta/ref/reference/vow.Promise.xml
 * @name MultiGeocoder.geocode
 * @param {Array} requests Массив строк-имен топонимов и/или геометрий точек (обратное геокодирование)
 * @returns {Object} Как и в обычном геокодере, вернем объект-обещание.
 */
MultiGeocoder.prototype.geocode = function (requests, options) {
    var self = this,
        opts = ymaps.util.extend({}, self._options, options),
        size = requests.length,
        result = [],
        geoObjects = new ymaps.GeoObjectCollection();

    return new ymaps.vow.Promise(function (resolve, reject) {
        requests.forEach(function (request, index) {
            ymaps.geocode(request, opts)
                .then(
                    function (response) {
                        var geoObject = response.geoObjects.get(0);

                        geoObject && (result[index] = geoObject);
                        --size || (result.forEach(geoObjects.add, geoObjects), resolve({ geoObjects : geoObjects }));
                    },
                    function (err) {
                        reject(err);
                    }
                );
        });
    });
};

return MultiGeocoder;

});
