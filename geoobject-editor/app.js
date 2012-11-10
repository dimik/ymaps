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
        GeoObjectView: '../plugins/GeoObjectView',
        RollupButton: '../plugins/RollupButton',
        RollupButtonView: '../plugins/RollupButtonView'
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
    }
});

require(['map', 'Collection', 'RollupButton'], function (map, Collection, RollupButton) {
    var collection = new Collection(),
        button = new RollupButton();

    map.geoObjects.add(collection);
    map.controls.add(button, {top: 5, left: 5});

    collection.editor
        .startEditing()
        .startDrawing();

});
