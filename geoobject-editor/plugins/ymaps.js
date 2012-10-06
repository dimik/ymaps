define(function () {

    ymapsPlugin.provides = ['ymaps', 'map'];
    return ymapsPlugin;

    function ymapsPlugin(options, imports, register) {
        var container = document.createElement("div");

        document.body.appendChild(container);

        ymaps.ready(function () {
            register(null, {
                ymaps: ymaps,
                map: new ymaps.Map(container)
            });
        });
    }

});
