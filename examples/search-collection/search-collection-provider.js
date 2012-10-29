/**
 * Провайдер данных для стандартного ymaps.control.SearchControl.
 * Осуществляет поиск геообъектов в коллекции ymaps.GeoObjectCollecton
 * по определенным полям.
 * Реализует интерфейс IGeocodeProvider
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IGeocodeProvider.xml
 * @class
 * @name SearchCollectionProvider
 * @param {ymaps.GeoObjectCollection} collection Коллекция геообъектов по которой будем искать.
 */
function SearchCollectionProvider(collection) {
    this._collection = collection;
}

/**
 * Данная реализация ищет по полю properties.balloonContentBody
 * стандартным методом String.ptototype.indexOf.
 * Поиск можно усложнить, например искать по нескольким полям.
 * @function
 * @name SearchCollectionProvider.geocode
 * @param {String} request Строка запроса.
 * @param {Object} options Опции.
 * @returns {Object} Объект-обещание - экземпляр ymaps.util.Promise.
 */
SearchCollectionProvider.prototype.geocode = function (request, options) {
    var promise = new ymaps.util.Promise(),
        geoObjects = new ymaps.GeoObjectArray(),
        offset = options.skip || 0,
        limit = options.results || 10;

    // Ищем в пропертях каждого геообъекта в коллекции.
    this._collection.each(function (point) {
        var prop = point.properties.get('balloonContentBody');

        if(~prop.toLowerCase().indexOf(request.toLowerCase())) {
            geoObjects.add(new ymaps.GeoObject({
                geometry: {
                    type: "Point",
                    coordinates: point.geometry.getCoordinates()
                },
                properties: {
                    name: prop + ' name',
                    description: prop + ' description',
                    balloonContentBody: '<p>' + prop + '</p>',
                    boundedBy: point.geometry.getBounds()
                }
             }));
        }
    });

    var response = {
        // geoObjects: geoObjects.splice(offset, limit), // разкомментировать когда починят splice
        geoObjects: geoObjects, // геообъекты поисковой выдачи
        // метаинформация ответа
        metaData: {
            geocoder: {
                request: request, // строка обработанного запроса
                found: geoObjects.getLength(), // количество найденных результатов
                results: limit, // количество возвращенных результатов
                skip: offset // количество пропущенных результатов
            }
        }
    };

    // выполняем асинхронную обработку
    setTimeout(function () {
        promise.resolve(response);
    }, 0);

    // возвращаем объект-обещание
    return promise;
};

