define(['ready!ymaps', 'base-model'], function (ymaps, BaseModel) {

function GeoLocationModel(options) {
    BaseModel.apply(this, arguments);
};

ymaps.util.augment(GeoLocationModel, BaseModel, {
    _load: function () {
        return ymaps.geolocation.get(this._options);
    },
    process: function (res) {
        return res.geoObjects.get(0);
    }
});

return GeoLocationModel;

});
