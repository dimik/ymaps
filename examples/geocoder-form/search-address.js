function SearchAddress(map, form) {
    this._formModel = new SearchAddress.FormModel(form);
    this._mapView = new SearchAddress.MapView(map);

    this._attachHandlers();
}

SearchAddress.prototype = {
    constructor: SearchAddress,
    _attachHandlers: function () {
        this._formModel.events
            .on('searchsuccess', $.proxy(this._onSearchSuccess, this))
            .on('searcherror', $.proxy(this._onSearchError, this));
    },
    _detachHandlers: function () {
        this._formModel.events
            .off();
    },
    _onSearchSuccess: function (e) {
        this._mapView
            .clear()
            .render(e.searchresult);
    },
    _onSearchError: function (e) {
        if(window.console) {
            console.log(e.description);
        }
    },
    getModel: function () {
        return this._formModel;
    }
};

SearchAddress.MapView = function (map) {
    this._map = map;
    this._point = null;
};

SearchAddress.MapView.prototype = {
    constructor: SearchAddress.MapView,
    render: function (data) {
        var balloonContent = '<p><small>по запросу:</small>&nbsp;<em>' + data.request + '</em></p>' +
                '<p><small>найдено:</small>&nbsp;<strong>' + data.properties.text + '</strong></p>';

        this._point = new ymaps.Placemark(data.coordinates, {
            balloonContentBody: balloonContent
        });

        this._map.geoObjects
            .add(this._point);

        this._setMapBounds(data.properties.boundedBy);

        return this;
    },
    clear: function () {
        if(this._point) {
            this._map.geoObjects
                .remove(this._point);
            this._point = null;
        }

        return this;
    },
    _setMapBounds: function (bounds) {
        this._map.setBounds(bounds, {
            checkZoomRange: true,
            duration: 200,
            callback: ymaps.util.bind(this._onSetMapBounds, this)
        });
    },
    _onSetMapBounds: function () {
        this._point.balloon
            .open();
    }
};

SearchAddress.FormModel = function (form) {
    this._form = form;
    this._request = null;
    this.events = $({});

    this._attachHandlers();
};

SearchAddress.FormModel.prototype = {
    constructor: SearchAddress.FormModel,
    _attachHandlers: function () {
        this._form
            .on('submit', $.proxy(this._onFormSubmit, this));
    },
    _detachHandlers: function () {
        this._form
            .off("submit");
    },
    _onFormSubmit: function (e) {
        e.preventDefault();

        var input = $(e.target).find('.search-query');

        if(input.val()) {
            this.search(input.val());
        }
    },
    search: function (address) {
        ymaps.geocode(this._request = address)
            .then(
                $.proxy(this._onSearchSuccess, this),
                $.proxy(this._onSearchFailed, this)
            );
    },
    _onSearchSuccess: function (result) {
        var firstResult = result.geoObjects.get(0);

        if(firstResult) {
            this.events.trigger($.Event('searchsuccess', {
                searchresult: {
                    request: this._request,
                    coordinates: firstResult.geometry.getCoordinates(),
                    properties: firstResult.properties.getAll()
                }
            }));
        }
    },
    _onSearchFailed: function (error) {
        this.events.trigger($.Event('searcherror', {
            description: error
        }));
    }
};
