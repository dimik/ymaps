/**
 * Кластеризатор с составными иконками кластеров.
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Clusterer.xml
 * @class
 * @augments ymaps.Clusterer
 * @name PieChartClusterer
 * @param {Object} options Опции кластеризатора.
 */
function PieChartClusterer(options) {
    PieChartClusterer.superclass.constructor.apply(this, arguments);
}

/**
 * Константы
 */
PieChartClusterer.COLORS = {
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

PieChartClusterer.SIZES = [
    [65, 65],
    [80, 80],
    [95, 95]
];

PieChartClusterer.NUMBERS = [10, 100];

/**
 * Методы
 */
var methods = {
    createCluster: function (center, geoObjects) {
        var cluster = PieChartClusterer.superclass.createCluster.call(this, center, geoObjects);

        cluster.options.set('icons', this.getClusterIcons(geoObjects));

        return cluster;
    },

    getClusterIcons: function (geoObjects) {
        var numbers = this.options.get('clusterNumbers') || PieChartClusterer.NUMBERS,
            icons = this.options.get('clusterIcons') || [];

        for(var i = 0, len = numbers.length + 1; i < len; i++) {
            var size = icons[i] && icons[i].size ||
                    PieChartClusterer.SIZES[i] || PieChartClusterer.SIZES[PieChartClusterer.SIZES.length - 1],
                offset = icons[i] && icons[i].offset || [-Math.floor(size[0] / 2), -Math.floor(size[1] / 2)],
                href = this.formatClusterIconHref(size, this.getClusterIconColors(geoObjects));

            icons[i] = {
                href: href,
                size: size,
                offset: offset
            };
        }

        return icons;
    },

    getClusterIconColors: function (geoObjects) {
        var reducer = ymaps.util.bind(function (colors, geoObject) {
            var color = PieChartClusterer.COLORS[this.getPresetColor(geoObject)];

            colors[color] = colors[color] ? colors[color] + 1 : 1;

            return colors;
        }, this);

        return geoObjects.reduce(reducer, {});
    },

    formatClusterIconHref: function (size, colors) {
        var values = [],
            keys = Object.keys(colors);

        keys.forEach(function (key, index) {
            values[index] = colors[key];
        });

        return 'http://chart.googleapis.com/chart?cht=pc&chs=' + size[0] + 'x' + size[1]
            + '&chd=t:1|' + values.join(',') + '&chco=FFFFFF,' + (keys.length === 1 ? [keys[0], keys[0]].join('|') : keys.join('|')) + '&chf=a,s,000000AA|bg,s,00000000';
    },

    getPresetColor: function (geoObject) {
        return geoObject.options.get('preset', 'twirl#blueIcon').match(/#([a-z]+)[A-Z]/)[1];
    }
};

/**
 * @augments ymaps.Clusterer
 */
ymaps.ready(function () {
    ymaps.util.augment(PieChartClusterer, ymaps.Clusterer, methods);
});
