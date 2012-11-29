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
 * @static
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
 * Размеры иконок для всех размеров кластеров.
 * Элементов в этом массиве должно быть на 1 больше, чем элементов в массиве 'NUMBERS'.
 * @static
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
 * @static
 * @constant
 */
PieChartClusterer.NUMBERS = [10, 100];

/**
 * Прозрачность иконки кластера.
 * @static
 * @constant
 */
PieChartClusterer.OPACITY = 0.7;

/**
 * Шаблон урла иконки кластера.
 * @static
 * @constant
 */
PieChartClusterer.URL_TEMPLATE = [
    '//chart.googleapis.com/chart?cht=pc',
    'chs=#{width}x#{height}', // Размеры чарта.
    'chd=t:1|#{data}', // Данные чарта.
    'chco=FFFFFF,#{colours}', // Цвета сегментов.
    'chf=a,s,000000#{opacity}|bg,s,00000000' // Background.
].join('&');


/**
 * Преобразование значения прозрачности иконки кластера из диапазона [0..1] в [00..FF].
 * @static
 * @function
 * @name PieChartClusterer.dec2hex
 * @param {Number} dec Прозрачность в диапазоне от 0 до 1.
 * @returns {String} Hex представление прозрачности в диапазоне от 00 до FF.
 */
PieChartClusterer.dec2hex = function (dec) {
    var hex = Math.floor(dec * 255).toString(16);

    return hex.length < 2 && '0' + hex || hex;
};

/**
 * Наследуемся после готовности АПИ.
 * @lends PieChartClusterer.prototype
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
            var cluster = PieChartClusterer.superclass.createCluster.apply(this, arguments);

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
         * Получение опции 'clusterIconOpacity' - определяет значение прозрачности иконки кластера.
         * @function
         * @name PieChartClusterer.getClusterIconOpacity
         * @returns {Number} Значение прозрачности иконок в диапазоне от 0 до 1.
         */
        getClusterIconOpacity: function () {
            return this.options.get('clusterIconOpacity', PieChartClusterer.OPACITY);
        },

        /**
         * Получение размеров иконок кластеров.
         * @function
         * @name PieChartClusterer.getClusterIconSizes
         * @returns {Number[][]} Ширина и высота иконок.
         */
        getClusterIconSizes: function () {
            var icons = this.options.get('clusterIcons');

            if(icons) {
                var sizes = [], size, i = 0;

                while(size = icons[i] && icons[i].size) {
                    sizes[i++] = size;
                }

                return sizes;
            }

            return PieChartClusterer.SIZES;
        },

        /**
         * Получение опции 'clusterIcons' - определяет внешний вид каждой группы иконок кластера.
         * Элементов в этом массиве должно быть на 1 больше, чем элементов в массиве опции 'clusterNumbers'.
         * @function
         * @name PieChartClusterer.getClusterIcons
         * @returns {Array} Опция кластера.
         */
        getClusterIcons: function (geoObjects) {
            var sizes = this.getClusterIconSizes(),
                size, i = 0, icons = [];

            while(size = sizes[i]) {
                icons[i++] = {
                    href: this.formatClusterIconHref(size, this.getClusterIconColours(geoObjects)),
                    size: size,
                    offset: [-Math.floor(size[0] / 2), -Math.floor(size[1] / 2)]
                };
            }

            return icons;
        },

        /**
         * Возвращает количество геообъектов каждого цвета.
         * @function
         * @name PieChartClusterer.getClusterIconColors
         * @param {ymaps.GeoObject[]} geoObjects Массив геообъектов кластера.
         * @returns {Object} Соотношение имен цветов и количества геообъектов данного цвета.
         */
        getClusterIconColours: function (geoObjects) {
            var count = geoObjects.length,
                countByColour = {},
                colour, geoObject;

            while(geoObject = geoObjects[--count]) {
                colour = PieChartClusterer.COLOURS[this.getPresetColour(geoObject)];

                countByColour[colour] = countByColour[colour] + 1 || 1;
            }

            return countByColour;
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
            // Количество геообъектов каждого цвета.
            var values = [],
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
                opacity: PieChartClusterer.dec2hex(this.getClusterIconOpacity())
            };

            return PieChartClusterer.URL_TEMPLATE.replace(/#{(\w+)}/g, function (s, key) {
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
