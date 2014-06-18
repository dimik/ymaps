ymaps.modules.define('jquery', [
    'script-loader',
    'jquery-config'
], function (provide, loader, config) {

loader.load(config.get('url'))
    .done(function () {
        provide(jQuery.noConflict(true));
    }, function (err) {
        provide(null, err);
    });

});
