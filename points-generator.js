/**
 * Random-генератор маркеров.
 * @class
 * @name RandomPointsGenerator
 * @param {Number} count Количество меток которые надо создать.
 * @example
   var placemarks = RandomPointsGenerator.generate(200)
        .fromBounds(myMap.getBounds());
 */
function RandomPointsGenerator(count) {
    this.count = count || 0;
}

/**
 * @static
 * @function
 * @name RandomPointsGenerator.generate
 * @param {Number} count Количество меток которые надо создать.
 * @returns {RandomPointsGenerator} Экземпляр генератора маркеров.
 */
RandomPointsGenerator.generate = function (count) {
    return new RandomPointsGenerator(count);
};

/**
 * Генерит случайным образом маркеры в области bounds.
 * @function
 * @name RandomPointsGenerator.pointsByBounds
 * @param {Number[][]} bounds Область видимости маркеров.
 * @returns {ymaps.Placemark[]} Массив маркеров.
 */
RandomPointsGenerator.prototype.fromBounds = function (bounds) {
    // протяженность области просмотра в градусах
    var span = [bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]],
        points = [];

    for(var i = 0; i < this.count; i++) {
        points[i] = this.createMarker([Math.random() * span[0] + bounds[0][0], Math.random() * span[1] + bounds[0][1]], i);
    }

    return points;
};

/**
 * Создает маркер по координатам.
 * @function
 * @name RandomPointsGenerator.createMarker
 * @param {Number[]} coordinates Массив координат.
 * @param {Number} index Индекс маркера.
 * @returns {ymaps.Placemark} Метка.
 */
RandomPointsGenerator.prototype.createMarker = function (coordinates, index) {
    return new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: coordinates
        },
        properties: this.getData(index)
    }, this.getOptions(index));
};

/**
 * Метод для перекрытия. Возвращает объект с данными,
 * который передается как поле properties в конструктор геообъекта.
 * @function
 * @name RandomPointsGenerator.getData
 * @param {Number} index Индекс маркера.
 * @returns {Object} Данные метки.
 */
RandomPointsGenerator.prototype.getData = function (index) {
    return {};
};

/**
 * Метод для перекрытия. Возвращает объект с опциями,
 * который передается как параметр options в конструктор геообъекта.
 * @function
 * @name RandomPointsGenerator.getOptions
 * @param {Number} index Индекс маркера.
 * @returns {Object} Опции метки.
 * @example
   var generator = RandomPointsGenerator.generate(200);

   // Перекрываем метод для создания меток со случайным хначением опции preset.
   generator.getOptions = function (i) {
       var presets = ['twirl#blueIcon', 'twirl#orangeIcon', 'twirl#darkblueIcon', 'twirl#pinkIcon'];

       return {
           preset: presets[Math.floor(Math.random() * presets.length)]
       };
   };
 */
RandomPointsGenerator.prototype.getOptions = function (index) {
    return {};
};
