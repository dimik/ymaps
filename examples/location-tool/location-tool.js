function LocationTool(map, options) {
    this._view = new LocationTool.View();
    this._mapView = new LocationTool.MapView(map);
    this._monitor = new ymaps.Monitor(this._mapView.state);
    this._setupMonitor();
    this._initView();
}

LocationTool.prototype = {
    constructor: LocationTool,
    _initView: function () {
        this._view.render(this._mapView.state.getAll());
    },
    _setupMonitor: function () {
        this._monitor
            .add(['mapCenter', 'mapZoom', 'markerPosition'], this._onMapViewStateChange, this);
    },
    _clearMonitor: function () {
        this._monitor
            .removeAll();
    },
    _onMapViewStateChange: function (data) {
        this._view.render(data);
    }
};

LocationTool.MapView = function (map) {
    this._map = map;
    // Интервал обновления данных (millisec) при кинетическом движении карты.
    this._updateTimeout = 10;
    this._marker = this._createDraggableMarker();
    map.geoObjects.add(this._marker);
    this.state = new ymaps.data.Manager({
        mapCenter: map.getCenter(),
        mapZoom: map.getZoom(),
        markerPosition: map.getCenter()
    });
    this._attachHandlers();
};

LocationTool.MapView.prototype = {
    constructor: LocationTool.MapView,
    _attachHandlers: function () {
        this._map.events
            .add('boundschange', this._onMapBoundsChange, this)
            .add('actiontick', this._onMapAction, this)
            /* Во время плавного движения карты, у браузеров поддерживающих CSS3 Transition,
             * actiontick не кидается, поэтому используем этот прием через setInterval.
             */
            .add('actionbegin', this._onMapActionBegin, this)
            .add('actionend', this._onMapActionEnd, this);

        this._marker.events
            .add('drag', this._onMarkerDrag, this);
    },
    _onMarkerDrag: function (e) {
        this.state.set({
            markerPosition: e.get('target').geometry.getCoordinates()
        });
    },
    _onMapActionBegin: function (e) {
        if(this._intervalId) {
            return;
        }

        this._intervalId = window.setInterval(
            ymaps.util.bind(this._onMapAction, this),
            this._updateTimeout
        );
    },
    _onMapActionEnd: function (e) {
        window.clearInterval(this._intervalId);
        this._intervalId = null;
    },
    _onMapAction: function () {
        var state = this._map.action.getCurrentState(),
            zoom = state.zoom,
            center = this._map.options.get('projection').fromGlobalPixels(
                state.globalPixelCenter, zoom
            );

        this.state.set({
            mapCenter: center,
            mapZoom: zoom
        });
    },
    _onMapBoundsChange: function (e) {
        this.state.set({
            mapCenter: e.get('newCenter'),
            mapZoom: e.get('newZoom')
        });
    },
    _createDraggableMarker: function () {
        return new ymaps.Placemark(this._map.getCenter(), {
            hintContent: 'Перетащите метку'
        }, {
            draggable: true
        });
    }
};

LocationTool.View = function () {
    this._element = $($('#positionDataTemplate').text());
    this._container = $('#container');
    this._container
        .append(this._element);
}

LocationTool.View.prototype = {
    constructor: LocationTool.View,
    render: function (data) {
        $.each(data, $.proxy(this._setData, this));
    },
    _toFixedNumber: function (coords) {
        return Number(coords).toFixed(6);
    },
    _setData: function (key, value) {
        this._element
            .find('#' + key)
            .val(
                $.isArray(value)?
                    $.map(value, this._toFixedNumber).join(', ') : value
            );
    },
    clear: function () {
        this._element.remove();
    }
};

/*
 * До лучших времен
function CrossControl () {
    CrossControl.superclass.constructor.apply(this, arguments);
}

ymaps.ready(function () {
    ymaps.util.augment(CrossControl, ymaps.control.Base, {
        onAddToMap: function (map) {
            CrossControl.superclass.onAddToMap.call(this, map);

            var container = $(this.getParent().getChildElement(this));
            this._el = $('img', {
                src: '//api.yandex.ru/i/maps/icons/center.gif'
            });
            container.append(this._el);
        },
        onRemoveFromMap: function () {
            this._el.remove();
            CrossControl.superclass.onRemoveFromMap.call(this);
        }
    });
});
 */
