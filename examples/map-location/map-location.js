function MapLocation(state) {
    this._state = state || {};
}

MapLocation.prototype.setMap = function (map) {
    map.events[map == null && 'remove' || 'add'](['boundschange', 'typechange'], this._onStateChange, this);

    return this;
};

MapLocation.prototype._onStateChange = function (e) {
    e.get('target').events.fire('statechange', {
        oldState: this,
        newState: new MapLocation({
            center: e.get('newCenter') || this.get('center'),
            zoom: e.get('newZoom') >= 0 ? e.get('newZoom') : this.get('zoom'),
            type: e.get('newType') || this.get('type')
        })
    });
};

MapLocation.prototype.get = function (param) {
    return this._state[param];
};

MapLocation.prototype.set = function (param, value) {
    if(value != null) {
        this._state[param] = value;
    }

    return this;
};

MapLocation.prototype.getState = function () {
    return this._state;
};

MapLocation.prototype.toString = function () {
    var state = this._state,
        params = [];

    for(var param in state) {
        params.push(encodeURI(param) + '=' + encodeURI(state[param]));
    }

    return params.join('&');
};

MapLocation.fromString = function (location) {
    var params = {};

    location.replace(/[^?&#]+(?=&|$)/g, function (s) {
        var param = s.split('=');

        params[param[0]] = param[1];
    });

    return new MapLocation({
        center: (params.center || '0,0').split(',').map(Number),
        zoom: Number(params.zoom || '0'),
        type: params.type || 'yandex#map'
    });
};
