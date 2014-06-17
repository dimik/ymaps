CircleSector.Model = function (map) {
    this._map = map;
    this.events = new ymaps.event.Manager();
};

CircleSector.Model.prototype = {
    constructor: CircleSector.Model,
    listen: function (events) {
        switch(typeof events) {
            case 'string':
                this._attachHandler(events);
                break;
            default:
                for(var i = 0, len = events.length; i < len; i++) {
                    this._attachHandler(events[i]);
                }
        }

        return this;
    },
    unlisten: function (events) {
        switch(typeof events) {
            case 'string':
                this._detachHandler(events);
                break;
            default:
                for(var i = 0, len = events.length; i < len; i++) {
                    this._detachHandler(events[i]);
                }
        }

        return this;
    },
    _attachHandler: function (event) {
        var handler;

        switch(event) {
            case 'mouseup':
                handler = this._onMouseUp;
                // In case of 'mouseup' we should listen to geoObjects also.
                this._map.geoObjects.events
                    .add(event, handler, this);
                break;
            case 'mousedown':
                handler = this._onMouseDown;
                break;
            case 'mousemove':
                handler = this._onMouseMove;
                break;
            case 'click':
                handler = this._onClick;
                break;
            default:
                throw new TypeError('listening event "' + event + '" is not supported');
        }
        this._map.events
            .add(event, handler, this);
    },
    _detachHandler: function (event) {
        var handler;

        switch(event) {
            case 'mouseup':
                handler = this._onMouseUp;
                // In case of 'mouseup' we should remove listener from geoObjects also.
                this._map.geoObjects.events
                    .remove(event, handler, this);
                break;
            case 'mousedown':
                handler = this._onMouseDown;
                break;
            case 'mousemove':
                handler = this._onMouseMove;
                break;
            case 'click':
                handler = this._onClick;
                break;
            default:
                throw new TypeError('removing listener for event "' + event + '" is not supported');
        }
        this._map.events
            .remove(event, handler, this);
    },
    _onMouseDown: function (e) {
        this.events.fire('mousedown', e);
    },
    _onMouseUp: function (e) {
        this.events.fire('mouseup', e);
    },
    _onMouseMove: function (e) {
        this.events.fire('mousemove', e);
    },
    _onClick: function (e) {
        this.events.fire('click', e);
    }
};
