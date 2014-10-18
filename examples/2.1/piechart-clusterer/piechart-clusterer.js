ymaps.modules.define('PieChartClusterer', [
    'Clusterer',
    'ClusterPlacemark',
    'data.Manager',
    'util.augment',
    'util.extend',
    'PieChartClusterer.component.colors'
], function (provide, Clusterer, ClusterPlacemark, DataManager, augment, extend, colors) {
    function PieChartClusterer(options) {
        PieChartClusterer.superclass.constructor.call(this, extend({ clisterIcons: '' }, options));
        // PieChartClusterer.superclass.constructor.call(this, options);
    }
    augment(PieChartClusterer, Clusterer, {
        createCluster: function (center, geoObjects) {
            var iconHref = this._renderIcon(geoObjects),
                options = {
                    clusterIcons: [{
                        href: iconHref,
                        size: [50, 50],
                        offset: [-25, -25]
                    }],
                    clusterNumbers: [100]
                };

            /*return new ClusterPlacemark(center, new DataManager({
                geoObjects: geoObjects,
                iconContent: geoObjects.length.toString()
            }), options);*/
            // Создаем метку-кластер с помощью стандартной реализации метода.
            var clusterPlacemark = PieChartClusterer.superclass.createCluster.call(this, center, geoObjects);

            clusterPlacemark.options.set(options);

            return clusterPlacemark;
        },
        _renderIcon: function (geoObjects) {
            var presetGroups = {},
                geoObject, preset, i = 0;

            while(geoObject = geoObjects[i++]) {
                preset = geoObject.options.get('preset');
                presetGroups[preset] = ++presetGroups[preset] || 1;
            }

            return this._drawCanvas(presetGroups, geoObjects.length).toDataURL();
        },
        _getIconSize: function (total) {
            var icons = this.options.get('clusterIcons', []),
                numbers = this.options.get('clusterNumbers', [10, 100]);

            // как вернуть правильный size????
            return 50;
        },
        _drawCanvas: function (presetGroups, total) {
            var startAt = 0,
                size = this._getIconSize(total),
                radius = size / 2,
                canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                toRadians = function (deg) {
                    return deg * Math.PI / 180;
                };

            canvas.width = canvas.height = size;

            for(var preset in presetGroups) {
                var count = presetGroups[preset],
                    color = this._getPresetColor(preset),
                    endAt = startAt + (count * 360 / total);

                ctx.fillStyle = color;
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(size, size);
                ctx.arc(size, size, radius, toRadians(startAt), toRadians(endAt));
                ctx.lineTo(size, size);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                startAt = endAt;
            }

            return canvas;
        },
        _getPresetColor: function (preset) {
            var re = /#(.*)Icon/;

            return colors[preset.match(re)[1]];
        }
    });

    provide(PieChartClusterer);
});

ymaps.modules.define('PieChartClusterer.component.colors', [
], function (provide) {
    var colors = {
        blue: '#1E98FF',
        red: '#ED4543',
        darkOrange: '#E6761B',
        night: '#0E4779',
        darkBlue: '#177BC9',
        pink: '#F371D1',
        gray: '#B3B3B3',
        brown: '#793D0E',
        darkGreen: '#1BAD03',
        violet: '#B51EFF',
        black: '#595959',
        yellow: '#FFD21E',
        green: '#56DB40',
        orange: '#FF931E',
        lightBlue: '#82CDFF',
        olive: '#97A100'
    };

    provide(colors);
});
