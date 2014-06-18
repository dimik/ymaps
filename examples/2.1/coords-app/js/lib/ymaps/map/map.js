ymaps.modules.define('ymaps-map', [
    'Map',
    'ymaps-map-config'
], function (provide, Map, config) {

provide(
    new Map(
        config.container,
        config.state,
        config.options
    )
);

});
