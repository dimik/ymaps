ym.modules.define('template.filter.geometryToBase64', [
    'template.filtersStorage'
], function (provide, filtersStorage, LineString, Polygon) {

    var geometryToBase64 = function (data, value, param) {
        var geometry = value.getObject();

        return geometry.constructor.toEncodedCoordinates(geometry);
    };

    filtersStorage.add('geometryToBase64', geometryToBase64);

    provide(filtersStorage);
});
