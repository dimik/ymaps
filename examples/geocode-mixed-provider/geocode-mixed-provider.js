function GeocodeMixedProvider() {
    this._providers = [
        'yandex#map',
        'yandex#publicMap'
    ];
}

GeocodeMixedProvider.prototype = {
    constructor: GeocodeMixedProvider,
    geocode: function (request, options) {
        var promise = new ymaps.util.Promise();

        ymaps.geocode.call(ymaps, request, ymaps.util.extend({}, options, { provider: 'yandex#map' }))
            .then(function (res) {
                if(res && res.geoObjects.getLength()
                    //&& res.geoObjects.get(0).properties.get('metaDataProperty.GeocoderMetaData.precision') === 'exact'
                    ) {

                    promise.resolve(res);
                }
                else {
                    ymaps.geocode.call(ymaps, request, ymaps.util.extend({}, options, { provider: 'yandex#publicMap' }))
                        .then(function (res) {
                            promise.resolve(res);
                        }, function (err) {
                            promise.reject(err);
                        });
                }
            }, function (err) {
                promise.reject(err);
            });

        return promise;
    }
};
