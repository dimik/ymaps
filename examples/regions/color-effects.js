function ColorFx(from, to, duration, interval) {
    this._from = this._getColorValues(from);
    this._to = this._getColorValues(to);
    this._duration = Number(duration) || 500;
    this._interval = Number(interval) || 50;
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
            this.animationState = New Animation(this._duration / this._interval;
            tick = function () {
                fn(
                    self._formatColor(
                        self._generateColor(++step)
                    )
                );
            };
        return new Animation(
    }
};

function Animate(steps, fps) {
    this._steps = steps;
    this._interval = interval;
    this._timerId = null;
}

Animate.prototype = {
    constructor: Animate,
    start: function (tick, complete) {
        var step = 0;

        this._timerId = window.setInterval(function () {
            tick();
            if(step === self._steps) {
                self.stop();
                if(typeof complete === 'function') {
                    complete();
                }
            }
        }, 1000 / fps);

        return this;
    },
    stop: function () {
        if(this._timerId) {
            window.clearInterval(this._timerId);
            this._timerId = null;
        }

        return this;
    }
};
