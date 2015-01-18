ym.modules.define('template.filter.geometry.base64', [
    'template.filtersStorage'
], function (provide, filtersStorage) {

    var geometryToBase64 = function (data, value, param) {
        var geometry = value.getObject();

        return geometry.constructor.toEncodedCoordinates(geometry);
    };

    filtersStorage.add('geometry#base64', geometryToBase64);

    provide(filtersStorage);
});
