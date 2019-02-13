/**
 * @fileOverview
 * Реализация множественного геокодирования для версии АПИ 2.1.
 *
 * @example
 var multiGeocoder = new MultiGeocoder({ boundedBy : map.getBounds() });

 multiGeocoder
 .geocode(['Москва, Льва Толстого 16', [55.7, 37.5], 'Санкт-Петербург'])
 .then(
 function (res) {
                   map.geoObjects.add(res.geoObjects);
               },
 function (err) {
                   console.log(err);
               }
 );
 */

/**
 * Класс для геокодирования списка адресов или координат.
 * @class
 * @name MultiGeocoder
 * @param {Object} [options={}] Дефолтные опции мультигеокодера.
 */
function MultiGeocoder(options) {
    this._options = options || {};
}

/**
 * Функция множественнеого геокодирования.
 * @function
 * @name MultiGeocoder.geocode
 * @param {Array} requests Массив строк-имен топонимов и/или геометрий точек (обратное геокодирование)
 * @returns {Object} Как и в обычном геокодере, вернем объект-обещание.
 */

MultiGeocoder.prototype.geocode = function (requests, options) {
    var self = this,
        size = requests.length,
        def = new ymaps.vow.Deferred(),
        geoObjects = new ListCollection();

    requests.forEach(function (request, index) {
        ymaps.geocode(request, ymaps.util.extend({}, self._options, options))
            .then(
            function (response) {
                var geoObject = response.geoObjects.get(0);
                geoObject && geoObjects.add(geoObject, index);
                --size || def.resolve({ geoObjects: geoObjects });
            },
            function (err) {
                def.reject(err);
            }
        );
    });
    return def.promise();
};
