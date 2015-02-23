ym.modules.define('RandomPointsGenerator', [
    'coordSystem.geo'
], function (provide, coordSystem) {
    /**
     * Random-генератор меток.
     * @class
     * @name RandomPointsGenerator
     * @param {Number} count Количество меток которые надо создать.
     * @example
     var placemarks = RandomPointsGenerator.generate(200).atBounds(myMap.getBounds());
     */
    function RandomPointsGenerator(count) {
        this.count = count || 0;
    }

    /**
     * Статический метод для удобства инстанцирования.
     * @static
     * @function
     * @name RandomPointsGenerator.generate
     * @param {Number} count Количество меток которые надо создать.
     * @returns {RandomPointsGenerator} Экземпляр генератора меток.
     */
    RandomPointsGenerator.generate = function (count) {
        return new RandomPointsGenerator(count);
    };

    /**
     * Устанавливает количество меток для генерации.
     * @function
     * @name RandomPointsGenerator.generate
     * @param {Number} count Количество меток которые надо создать.
     * @returns {RandomPointsGenerator} Экземпляр генератора меток.
     */
    RandomPointsGenerator.prototype.generate = function (count) {
        this.count = count;

        return this;
    };

    /**
     * Генерит случайным образом метки в области bounds.
     * @function
     * @name RandomPointsGenerator.atBounds
     * @param {Number[][]} bounds Область видимости меток.
     * @returns {ymaps.Placemark[]} Массив меток.
     */
    RandomPointsGenerator.prototype.atBounds = function (bounds) {
        // протяженность области просмотра в градусах
        var span = [bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]],
            points = [];

        for(var i = 0; i < this.count; i++) {
            points[i] = this.createPlacemark([Math.random() * span[0] + bounds[0][0], Math.random() * span[1] + bounds[0][1]], i);
        }

        return points;
    };

    /**
     * Генерит случайным образом метки внутри окружности с данным центром и радиусом.
     * @function
     * @name RandomPointsGenerator.atCenterAndRadius
     * @param {Number[]} center Координаты центра окружности.
     * @param {Number} radius Радиус окружности в метрах.
     * @returns {ymaps.Placemark[]} Массив меток.
     */
    RandomPointsGenerator.prototype.atCenterAndRadius = function (center, radius) {
        var distance, direction, coords, points = [];

        for(var i = 0; i < this.count; i++) {
            direction = [Math.random() - Math.random(), Math.random() - Math.random()];
            distance = radius * Math.random();
            coords = coordSystem.solveDirectProblem(center, direction, distance).endPoint;
            points[i] = this.createPlacemark(coords, i);
        }

        return points;
    };

    /**
     * TODO
     * Генерит случайным образом метки внутри области с данным центром и линейными размерами.
     * @function
     * @name RandomPointsGenerator.atCenterAndSize
     * @param {Number[]} center Координаты центра области.
     * @param {Number[]} size Линейные размеры области в метрах.
     * @returns {ymaps.Placemark[]} Массив меток.
     */
    RandomPointsGenerator.prototype.atCenterAndSize = function (center, size) {};

    /**
     * Создает метку по координатам.
     * @function
     * @name RandomPointsGenerator.createPlacemark
     * @param {Number[]} coordinates Массив координат.
     * @param {Number} index Индекс метки.
     * @returns {ymaps.Placemark} Метка.
     */
    RandomPointsGenerator.prototype.createPlacemark = function (coordinates, index) {
        return new ymaps.GeoObject({
            geometry: {
                type: "Point",
                coordinates: coordinates
            },
            properties: this.getPointData(index)
        }, this.getPointOptions(index));
    };

    /**
     * Метод для перекрытия. Возвращает объект с данными,
     * который передается как поле properties в конструктор геообъекта.
     * @function
     * @name RandomPointsGenerator.getPointData
     * @param {Number} index Индекс метки.
     * @returns {Object} Данные метки.
     */
    RandomPointsGenerator.prototype.getPointData = function (index) {
        return {};
    };

    /**
     * Метод для перекрытия. Возвращает объект с опциями,
     * который передается как параметр options в конструктор геообъекта.
     * @function
     * @name RandomPointsGenerator.getPointOptions
     * @param {Number} index Индекс метки.
     * @returns {Object} Опции метки.
     * @example
     var generator = RandomPointsGenerator.generate(200);

     // Перекрываем метод для создания меток со случайным хначением опции preset.
     generator.getPointOptions = function (i) {
         var presets = ['islands#blueIcon', 'islands#orangeIcon', 'islands#darkblueIcon', 'islands#pinkIcon'];

         return {
             preset: presets[Math.floor(Math.random() * presets.length)]
         };
     };
     */
    RandomPointsGenerator.prototype.getPointOptions = function (index) {
        return {};
    };

    provide(RandomPointsGenerator);
});
