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

var PieChartClustererMethods = {
    /**
     * Это перекрытие для базоваго метода ymaps.Clusterer,
     * рекомендованный разработчиками способ изменения вида кластера.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Clusterer.xml#createCluster
     */
    createCluster: function (center, geoObjects) {
        var cluster = PieChartClusterer.superclass.createCluster.call(this, center, geoObjects);

        cluster.options.set({
            icons: this.getClusterIcons(geoObjects),
            numbers: this.getClusterNumbers()
        });

        return cluster;
    },

    getClusterNumbers: function () {
        return this.options.get('clusterNumbers', PieChartClusterer.NUMBERS);
    },

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

    formatClusterIconHref: function (size, colours) {
        var dec2hex = function (dec) {
                hex = Math.floor(dec * 255).toString(16);

                return hex.length < 2 && '0' + hex || hex;
            },
            opacity = this.options.get('clusterIconOpacity', PieChartClusterer.OPACITY),
            url = ['http://chart.googleapis.com/chart?cht=pc',
                'chs=#{width}x#{height}',
                'chd=t:1|#{data}',
                'chco=FFFFFF,#{colors}',
                'chf=a,s,000000#{opacity}|bg,s,00000000'
            ],
            values = [],
            keys = [], key, i = 0;

        for(key = keys[i] in colours) {
            values[i++] = colours[key];
        }

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

    getPresetColour: function (geoObject) {
        return geoObject.options.get('preset', 'twirl#blueIcon').match(/#([a-z]+)[A-Z]/)[1];
    }
};

/**
 * @augments ymaps.Clusterer
 */
ymaps.ready(function () {
    ymaps.util.augment(PieChartClusterer, ymaps.Clusterer, PieChartClustererMethods);
});
