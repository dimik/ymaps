// Провайдер данных для элемента управления ymaps.control.SearchControl.
// Осуществляет поиск геообъектов в по массиву points.
// Реализует интерфейс IGeocodeProvider.
function CustomSearchProvider(points) {
    this.points = points;
}

// Провайдер ищет по полю text стандартным методом String.ptototype.indexOf.
CustomSearchProvider.prototype.geocode = function (request, options) {
    var promise = new ymaps.util.Promise(),
        geoObjects = new ymaps.GeoObjectArray(),
        // Сколько результатов нужно пропустить.
        offset = options.skip || 0,
        // Количество возвращаемых результатов.
        limit = options.results || 20,
        i = 0, l = 0;

    // Ищем в свойстве text каждого элемента массива.
    // При формировании ответа можно учитывать offset и limit.
    this.points.forEach(function (point) {
        var text = point.text,
            coords = point.coords;

        if(~text.toLowerCase().indexOf(request.toLowerCase()) && i++ >= offset && l < limit) {
            geoObjects.add(new ymaps.Placemark(coords, {
                name: text + ' name',
                description: text + ' description',
                balloonContentBody: '<p>' + text + '</p>',
                boundedBy: [coords, coords]
            }));
            l++;
        }
    });

    var response = {
        // Геообъекты поисковой выдачи.
        geoObjects: geoObjects,
        // Метаинформация ответа.
        metaData: {
            geocoder: {
                // Строка обработанного запроса.
                request: request,
                // Количество найденных результатов.
                found: geoObjects.getLength(),
                // Количество возвращенных результатов.
                results: limit,
                // Количество пропущенных результатов.
                skip: offset
            }
        }
    };

    promise.resolve(response);

    // Возвращаем объект-обещание.
    return promise;
};
