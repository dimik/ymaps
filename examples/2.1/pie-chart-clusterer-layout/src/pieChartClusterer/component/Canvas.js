ym.modules.define('PieChartClusterer.component.Canvas', [
    'option.Manager',
    'PieChartClusterer.icon.colors'
], function (provide, OptionManager, iconColors) {
    var DEFAULT_OPTIONS = {
        iconStrokeStyle: 'white',
        iconLineWidth: 2,
        iconCoreRadius: 23,
        iconCoreFillStyle: 'white'
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

        return this._canvas.toDataURL();
    };

    Canvas.prototype._drawIcon = function (styleGroups, total) {
        var startAt = 0;
        var endAt = 360;
        var ctx = this._context;
        var x = this._canvas.width / 2;
        var y = this._canvas.height / 2;
        var lineWidth = this.options.get('iconLineWidth', DEFAULT_OPTIONS.iconLineWidth);
        var strokeStyle = this.options.get('iconStrokeStyle', DEFAULT_OPTIONS.iconStrokeStyle);
        var radius = Math.floor((x + y - lineWidth) / 2);

        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;

        Object.keys(styleGroups).forEach(function (style) {
            var num = styleGroups[style];

            endAt = startAt + (num * 360 / total);
            ctx.fillStyle = this._getStyleColor(style);

            if (total > num) {
                startAt = this._drawSector(x, y, radius, startAt, endAt);
            } else {
                this._drawCircle(x, y, radius);
            }
        }, this);

        this._drawCore(x, y);
    };

    Canvas.prototype._drawCore = function (x, y) {
        var ctx = this._context;
        var fillStyle = this.options.get('iconCoreFillStyle', DEFAULT_OPTIONS.iconCoreFillStyle);
        var radius = this.options.get('iconCoreRadius', DEFAULT_OPTIONS.iconCoreRadius);

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
