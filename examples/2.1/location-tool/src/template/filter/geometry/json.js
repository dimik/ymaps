ym.modules.define('template.filter.geometry.json', [
    'template.filtersStorage'
], function (provide, filtersStorage) {

    var geometryToJSON = function (data, value, param) {
        var geometry = value.getObject();

        return JSON.stringify(geometry.getCoordinates());
    };

    filtersStorage.add('geometry#json', geometryToJSON);

    provide(filtersStorage);
});
