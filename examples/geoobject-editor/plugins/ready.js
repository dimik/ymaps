/**
 * RequireJS plugin
 * Loads Yandex Maps API correctly by calling ymaps.ready
 */
define({
    load: function (name, require, load, config) {
        require([name], function (ymaps) {
            ymaps.ready(function () {
                load(ymaps);
            });
        });
    }
});
