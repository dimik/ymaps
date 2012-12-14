function MapLocation(map, state) {
    this._map = map;
    this._state = state;
    this._silent = false;

    map.events.add(['boundschange', 'typechange'], this._onStateChange, this);
}

MapLocation.prototype._onStateChange = function (e) {
    var oldState = this._state;

    if(this._silent) {
        this._silent = false;
    }
    else {
        this._map.events.fire('locationstatechange', {
            oldState: oldState,
            newState: (this._state = new MapLocationState({
                center: (e.get('newCenter') || oldState.get('center')).map(MapLocationState.toCoords),
                zoom: e.get('newZoom') >= 0 ? e.get('newZoom') : oldState.get('zoom'),
                type: e.get('newType') || oldState.get('type')
            }))
        });
    }
};

MapLocation.prototype.getState = function () {
    return this._state;
};

MapLocation.prototype.setState = function (data) {
    var map = this._map,
        state = this._state;

    this._silent = true;

    if(data.type === state.get('type')) {
        map.setCenter(data.center, data.zoom);
        state
            .set('center', data.center)
            .set('zoom', data.zoom);
    }
    else {
        map.setType(data.type);
        state.set('type', data.type);
    }

    return this;
};

function MapLocationState(data) {
    this._data = data;
}

MapLocationState.prototype.get = function (param) {
    return this._data[param];
};

MapLocationState.prototype.set = function (param, value) {
    if(value != null) {
        this._data[param] = value;
    }

    return this;
};

MapLocationState.prototype.getData = function () {
    return this._data;
};

MapLocationState.prototype.toString = function () {
    var data = this._data,
        params = [];

    for(var param in data) {
        params.push(encodeURI(param) + '=' + encodeURIComponent(data[param]));
    }

    return params.join('&');
};

MapLocationState.fromString = function (location) {
    var params = {};

    location.replace(/[^?&#]+(?=&|$)/g, function (s) {
        var param = s.split('=');

        params[decodeURI(param[0])] = decodeURIComponent(param[1]);
    });

    return new MapLocationState({
        center: params.center.split(',').map(MapLocationState.toCoords),
        zoom: Number(params.zoom),
        type: params.type || 'yandex#map'
    });
};

MapLocationState.toCoords = function (i) {
    return Number(i).toFixed(6);
};
