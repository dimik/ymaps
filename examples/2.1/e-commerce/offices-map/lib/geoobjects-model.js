define(['ready!ymaps', 'jquery', 'base-model', 'module'], function (ymaps, $, BaseModel, module) {

function GeoObjectsModel(options) {
    BaseModel.apply(this, arguments);
}

ymaps.util.augment(GeoObjectsModel, BaseModel, {
    _load: function () {
        return $.ajax(this._options);
    },
    process: function (res) {
        return ymaps.geoQuery(res);
    },
    getDefaults: function () {
        return $.extend({
            dataType: 'json',
            context: this
        }, module.config());
    }
});

return GeoObjectsModel;

});
