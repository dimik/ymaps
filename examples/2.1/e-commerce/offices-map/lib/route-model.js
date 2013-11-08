define(['ready!ymaps', 'base-model'], function (ymaps, BaseModel) {

function RouteModel(options) {
    BaseModel.apply(this, arguments);
}

ymaps.util.augment(RouteModel, BaseModel, {
    _load: function (origin, destination) {
        return ymaps.route([origin, destination], this._options);
    },
    getDefaults: function () {
        return {
            url: 'data.json',
            dataType: 'json'
        };
    }
});

return RouteModel;

});
