ymaps.modules.define('PieChartClusterer', [
    'Clusterer',
    'util.augment',
    'util.extend',
    'PieChartClusterer.icon.params',
    'PieChartClusterer.component.Canvas'
], function (provide, Clusterer, augment, extend, iconParams, PieChartClustererCanvas) {
    var PieChartClusterer = function (options) {
        // PieChartClusterer.superclass.constructor.call(this, options);
        PieChartClusterer.superclass.constructor.call(this, extend({ clisterIcons: '' }, options));

        this._styleRegExp = /#(.*)Icon/;
        this._canvas = new PieChartClustererCanvas(iconParams.icons.large.size);
    };

    augment(PieChartClusterer, Clusterer, {
        createCluster: function (center, geoObjects) {
            // Создаем метку-кластер с помощью стандартной реализации метода.
            var clusterPlacemark = PieChartClusterer.superclass.createCluster.call(this, center, geoObjects),
                styleGroups = this._countByIconStyle(geoObjects),
                iconUrl = this._canvas.generateIconDataURL(styleGroups, geoObjects.length),
                clusterOptions = {
                    clusterIcons: [
                        extend({ href: iconUrl }, iconParams.icons.small),
                        extend({ href: iconUrl }, iconParams.icons.medium),
                        extend({ href: iconUrl }, iconParams.icons.large)
                    ],
                    clusterNumbers: iconParams.numbers
                };

            clusterPlacemark.options.set(clusterOptions);

            return clusterPlacemark;
        },
        _countByIconStyle: function (geoObjects) {
            var styleGroups = {},
                geoObject, style, i = 0;

            while(geoObject = geoObjects[i++]) {
                style = this._getIconStyle(geoObject.options.get('preset', 'islands#blueIcon'));
                styleGroups[style] = ++styleGroups[style] || 1;
            }

            return styleGroups;
        },
        _getIconStyle: function (preset) {
            return preset.match(this._styleRegExp)[1];
        }
    });

    provide(PieChartClusterer);
});

ymaps.modules.define('PieChartClusterer.component.Canvas', [
    'option.Manager',
    'PieChartClusterer.icon.colors'
], function (provide, OptionManager, iconColors) {
    var DEFAULT_OPTIONS = {
        strokeStyle: 'white',
        lineWidth: 2,
        coreRadius: 23,
        coreFillStyle: 'white'
    };

    var Canvas = function (size) {
        this._canvas = document.createElement('canvas');
        this._canvas.width = size[0];
        this._canvas.height = size[1];

        this._context = this._canvas.getContext('2d');
        this.options = new OptionManager({});
    };

    Canvas.prototype.generateIconDataURL = function (styleGroups, total) {
        this._drawIcon(styleGroups, total);

        // return this._canvas.toDataURL();
        return this._canvas;
    };

    Canvas.prototype._drawIcon = function (styleGroups, total) {
        var startAt = 0, endAt = 360,
            ctx = this._context,
            x = this._canvas.width / 2,
            y = this._canvas.height / 2,
            lineWidth = this.options.get('lineWidth', DEFAULT_OPTIONS.lineWidth),
            radius = Math.floor((x + y - lineWidth) / 2);

        ctx.strokeStyle = this.options.get('strokeStyle', DEFAULT_OPTIONS.strokeStyle);
        ctx.lineWidth = this.options.get('lineWidth', DEFAULT_OPTIONS.lineWidth);

        for(var style in styleGroups) {
            var num = styleGroups[style];

            endAt = startAt + (num * 360 / total);
            ctx.fillStyle = this._getStyleColor(style);

            if(total > num) {
                startAt = this._drawSector(x, y, radius, startAt, endAt);
            }
            else {
                this._drawCircle(x, y, radius);
            }
        }

        this._drawCore(x, y);
    };

    Canvas.prototype._drawCore = function (x, y) {
        var ctx = this._context,
            fillStyle = this.options.get('coreFillStyle', DEFAULT_OPTIONS.coreFillStyle),
            radius = this.options.get('coreRadius', DEFAULT_OPTIONS.coreRadius);

        ctx.fillStyle = fillStyle;
        this._drawCircle(x, y, radius);
    };

    Canvas.prototype._drawCircle = function (x, y, radius) {
        var ctx = this._context;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    };

    Canvas.prototype._drawSector = function (x, y, radius, startAt, endAt) {
        var ctx = this._context;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, this._toRadians(startAt), this._toRadians(endAt));
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        return endAt;
    };

    Canvas.prototype._toRadians = function (deg) {
        return deg * Math.PI / 180;
    };

    Canvas.prototype._getStyleColor = function (style) {
        return iconColors[style];
    };

    provide(Canvas);
});

ymaps.modules.define('PieChartClusterer.icon.colors', [
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

ymaps.modules.define('PieChartClusterer.icon.params', [
    'shape.Circle',
    'geometry.pixel.Circle'
], function (provide, CircleShape, PixelCircleGeometry) {
    provide({
        icons: {
            small: {
                size: [46, 46],
                offset: [-23, -23],
                shape: new CircleShape(new PixelCircleGeometry([0, 2], 21.5))
            },
            medium: {
                size: [58, 58],
                offset: [-29, -29],
                shape: new CircleShape(new PixelCircleGeometry([0, 2], 27.5))
            },
            large: {
                size: [71, 71],
                offset: [-35.5, -35.5],
                shape: new CircleShape(new PixelCircleGeometry([0, 2], 34))
            }
        },
        numbers: [ 10, 100 ]
    });
});
