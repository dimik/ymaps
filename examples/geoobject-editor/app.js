requirejs.config({
    baseUrl: 'lib',
    paths: {
        ymaps: 'http://api-maps.yandex.ru/2.0/?load=package.full&lang=ru-RU&mode=debug',
        ready: '../plugins/ymaps/ready',
        map: '../plugins/ymaps/map',
        RectangleGeometry: '../plugins/ymaps/geometry/Rectangle',
        Collection: '../plugins/Collection',
        CollectionBalloon: '../plugins/CollectionBalloon',
        CollectionEditor: '../plugins/CollectionEditor',
        CollectionEditorView: '../plugins/CollectionEditorView',
        GeoObjectEditor: '../plugins/GeoObjectEditor',
        GeoObjectEditorView: '../plugins/GeoObjectEditorView',
        GeoObjectView: '../plugins/GeoObjectView'
    },
    shim: {
        ymaps: {
            exports: 'ymaps'
        },
        jquery: {
            exports: '$'
        },
        bootstrap: {
            deps: ['jquery'],
        }
    },
    waitSeconds: 0
});

require(['map', 'Collection'], function (map, Collection) {
    var collection = new Collection();

    map.geoObjects.add(collection);
    collection.editor
        .startEditing()
        .startDrawing();

});
