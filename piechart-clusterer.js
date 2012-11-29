/**
 * Кластеризатор с составными иконками кластеров.
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Clusterer.xml
 * @class
 * @augments ymaps.Clusterer
 * @name PieChartClusterer
 * @param {Object} [options] Опции кластеризатора.
 */
function PieChartClusterer(options) {
    PieChartClusterer.superclass.constructor.apply(this, arguments);
}

/**
 * Соответствие цветов иконок АПИ с RRGGBB[AA] форматом.
 * @constant
 */
PieChartClusterer.COLOURS = {
    "blue"       : "0A6CC8",
    "darkblue"   : "3D4AE9",
    "darkgreen"  : "158B02",
    "darkorange" : "CD6D2D",
    "green"      : "1AB500",
    "grey"       : "94948E",
    "lightblue"  : "4391E7",
    "night"      : "143A6B",
    "orange"     : "CCA42B",
    "pink"       : "E666DD",
    "red"        : "E03632",
    "violet"     : "A41DE2",
    "white"      : "FFFFFF",
    "yellow"     : "D4C62C",
    "brown"      : "946134",
    "black"      : "000000"
};

/**
 * Размеры иконок для всех размеров кластеров согласно опции "numbers".
 * @constant
 */
PieChartClusterer.SIZES = [
    [65, 65],
    [80, 80],
    [95, 95]
];

/**
 * Массив, описывающий граничные значения для размеров кластеров.
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Cluster.xml
 * @constant
 */
PieChartClusterer.NUMBERS = [10, 100];

/**
 * Прозрачность иконки кластера.
 * @constant
 */
PieChartClusterer.OPACITY = 0.7;

/**
 * Наследуемся после готовности АПИ.
 * @augments ymaps.Clusterer
 */
ymaps.ready(function () {
    ymaps.util.augment(PieChartClusterer, ymaps.Clusterer, {
        /**
         * Это перекрытие для базоваго метода ymaps.Clusterer,
         * рекомендованный разработчиками способ изменения вида кластера.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Clusterer.xml#createCluster
         * @function
         * @name PieChartClusterer.createCluster
         * @param {Number[]} center Координаты центра кластера.
         * @param {ymaps.GeoObject[]} geoObjects Массив геообъектов кластера.
         */
        createCluster: function (center, geoObjects) {
            var cluster = PieChartClusterer.superclass.createCluster.call(this, center, geoObjects);

            // Выставляем кластеру нужные опции.
            cluster.options.set({
                icons: this.getClusterIcons(geoObjects),
                numbers: this.getClusterNumbers()
            });

            return cluster;
        },

        /**
         * Получение опции 'clusterNumbers' - определяет количество групп размеров иконок кластера
         * по количеству содержащихся в нем геообъектов.
         * @function
         * @name PieChartClusterer.getClusterNumbers
         * @returns {Number[]} Опция кластера.
         */
        getClusterNumbers: function () {
            return this.options.get('clusterNumbers', PieChartClusterer.NUMBERS);
        },

        /**
         * Получение опции 'clusterIcons' - определяет внешний вид каждой группы иконок кластера.
         * Элементов в этом массиве должно быть на 1 больше, чем элементов в массиве опции 'clusterNumbers'.
         * @function
         * @name PieChartClusterer.getClusterIcons
         * @returns {Array} Опция кластера.
         */
        getClusterIcons: function (geoObjects) {
            var icons = this.options.get('clusterIcons'),
                size, i = 0, result = [];

            while(size = icons && icons[i] && icons[i].size || PieChartClusterer.SIZES[i]) {
                result[i++] = {
                    href: this.formatClusterIconHref(size, this.getClusterIconColours(geoObjects)),
                    size: size,
                    offset: [-Math.floor(size[0] / 2), -Math.floor(size[1] / 2)]
                };
            }

            return result;
        },

        /**
         * Возвращает количество геообъектов каждого цвета.
         * @function
         * @name PieChartClusterer.getClusterIconColors
         * @param {Array} geoObjects Массив геообъектов.
         * @returns {Object} Соотношение имен цветов и количества геообъектов данного цвета.
         */
        getClusterIconColours: function (geoObjects) {
            var count = geoObjects.length,
                colours = {},
                colour, geoObject;

            while(geoObject = geoObjects[--count]) {
                colour = PieChartClusterer.COLOURS[this.getPresetColour(geoObject)];

                colours[colour] = colours[colour] + 1 || 1;
            }

            return colours;
        },

        /**
         * Формирует урл иконки кластера нужного размера.
         * @see https://developers.google.com/chart/image/
         * @function
         * @name PieChartClusterer.formatClusterIconHref
         * @param {Array} size Размер иконки - ширина х высота.
         * @param {Object} colours Количество геообъектов каждого цвета.
         * @returns {String} Урл иконки кластера.
         */
        formatClusterIconHref: function (size, colours) {
            // Преобразование значения прозрачности иконки кластера из диапазона [0..1] в [00..FF]
            var dec2hex = function (dec) {
                    hex = Math.floor(dec * 255).toString(16);

                    return hex.length < 2 && '0' + hex || hex;
                },
                // Прозрачность иконки.
                opacity = this.options.get('clusterIconOpacity', PieChartClusterer.OPACITY),
                // Шаблон урла.
                url = ['http://chart.googleapis.com/chart?cht=pc',
                    'chs=#{width}x#{height}',
                    'chd=t:1|#{data}',
                    'chco=FFFFFF,#{colours}',
                    'chf=a,s,000000#{opacity}|bg,s,00000000'
                ],
                // Количество геообъектов каждого цвета.
                values = [],
                // Цвета геообъектов.
                keys = [], key,
                i = 0;

            for(keys[i] in colours) {
                values[i] = colours[keys[i++]];
            }

            // Хэш ключей для замены в шаблоне урла.
            var model = {
                width: size[0],
                height: size[1],
                data: values.join(','),
                colours: (keys.length < 2 ? [keys[0], keys[0]] : keys).join('|'),
                opacity: dec2hex(opacity)
            };

            return url.join('&').replace(/#{(\w+)}/g, function (s, key) {
                return model[key];
            });
        },

        /**
         * Возвращает строковый идентификатор цвета иконки геообъекта из его пресета.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/option.presetStorage.xml
         * @function
         * @name PieChartClusterer.getPresetColour
         * @param {ymaps.GeoObject} geoObject Геообъект АПИ.
         * @returns {String} Цвета иконки геообъекта.
         */
        getPresetColour: function (geoObject) {
            return geoObject.options.get('preset', 'twirl#blueIcon').match(/#([a-z]+)[A-Z]/)[1];
        }
    });
});
