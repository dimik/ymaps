ym.modules.define('template.filter.geometry.bounds', [
    'template.filtersStorage'
], function (provide, filtersStorage) {

    var geometryToJSON = function (data, value, param) {
        var geometry = value.getObject();

        return JSON.stringify(geometry.getBounds());
    };

    filtersStorage.add('geometry#bounds', geometryToJSON);

    provide(filtersStorage);
});
