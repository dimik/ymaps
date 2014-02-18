define(['ready!ymaps'], function (ymaps) {

function UserLayerMapView() {
    this._data = null;
    this._layer = null;
    this._mapType = null;
}

UserLayerMapView.prototype = {
    constructor: UserLayerMapView,
    render: function (data) {
        this._data = data;

        var id = data.id;

        ymaps.layer.storage.add(id,
            this._layer = this._createLayer(data)
        );

        ymaps.mapType.storage.add(id,
            this._mapType = this._createMapType(data)
        );

        return this;
    },
    clear: function () {
        ymaps.layer.storage.remove(this._data.id);
        ymaps.mapType.storage.remove(this._data.id);

        this._data = this._layer = this._mapType = null;

        return this;
    },
    getName: function () {
        return this._data.id;
    },
    getLayer: function () {
        return this._layer;
    },
    getMapType: function () {
        return this._mapType;
    },
    getLegend: function () {
        return this._data.legend;
    },
    _createLayer: function (data) {
        return function () {
            var layer = new ymaps.Layer(data.tileUrlTemplate, {
                    tileTransparent: !data.isTransparent,
                    notFoundTile: data.notFoundTile
                });

            // Копирайты
            if(data.copyright) {
                layer.getCopyrights = function () {
                    var promise = new ymaps.vow.Promise(function (resolve, reject) {
                        resolve(data.copyright);
                    });

                    return promise;
                };
            }

            // Диапазон доступных масштабов на данном слое карты (надо вручную дописать layerMaxZoom/layerMinZoom в data)
            if(data.layerMaxZoom >= 0 && data.layerMinZoom >= 0) {
                layer.getZoomRange = function () {
                    var promise = new ymaps.vow.Promise(function (resolve, reject) {
                        resolve([data.layerMinZoom, data.layerMaxZoom]);
                    });


                    return promise;
                };
            }

            return layer;
        };
    },
    /**
     * Создание экземпляра пользовательского типа карты.
     * @private
     * @function
     * @name TilerConverter._createMapType
     * @returns {ymaps.MapType} Пользовательский тип карты.
     */
    _createMapType: function (data) {
        var layers = data.backgroundMapType?
                ymaps.mapType.storage.get(data.backgroundMapType).getLayers() : [];

        return new ymaps.MapType(data.title, layers.concat([data.id]));
    }
};

return UserLayerMapView;

});
