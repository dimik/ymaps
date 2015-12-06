define({
    load: function (name, require, load, config) {
        require([name], function () {
            ymaps.ready().then(function (ym) {
                load(ym);
            });
        });
    }
});
