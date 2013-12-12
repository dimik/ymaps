define({
    load: function (name, require, load, config) {
        require([name], function (ymaps) {
            ymaps.ready(function () {
                load(ymaps);
            });
        });
    }
});
