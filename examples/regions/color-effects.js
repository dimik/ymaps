function ColorFx(from, to, duration, interval) {
    this._from = this._getColorValues(from);
    this._to = this._getColorValues(to);
    this._duration = Number(duration) || 500;
    this._interval = Number(interval) || 50;
    this._steps = this._duration / this._interval;
    this._timerId = null;
}

ColorFx.prototype = {
    constructor: ColorFx,
    _getColorValues: function (s) {
        return s.match(/[\d.]+/g).map(Number);
    },
    _generateColor: function (step) {
        return this._from.map(function (value, index) {
            return value + (this._to[index] - value) / this._steps * step;
        }, this);
    },
    _formatColor: function (color) {
        return 'rgba(' +
            color.slice(0, 3)
                .map(Math.round)
                .join(',') +
            ',' +
            color[3].toFixed(2) +
        ')';
    },
    animate: function (fn, complete) {
        var self = this,
            step = 0,
            tick = function () {
                fn(
                    self._formatColor(
                        self._generateColor(++step)
                    )
                );

                if(step === self._steps) {
                    self.clear();
                    if(typeof complete === 'function') {
                        complete();
                    }
                }
            };

        this._timerId = window.setInterval(tick, this._interval);

        return this;
    },
    clear: function () {
        if(this._timerId) {
            window.clearInterval(this._timerId);
            this._timerId = null;
        }

        return this;
    }
};
