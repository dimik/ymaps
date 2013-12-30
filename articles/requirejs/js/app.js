requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        ymaps: '//api-maps.yandex.ru/2.0/?lang=ru-RU&load=package.full&coordorder=longlat',
        jquery: '//yandex.st/jquery/2.0.3/jquery.min',
        ready: 'requirejs/ymaps-ready'
    },
    config: {
        'geoobjects-model': {
            url: 'data.json'
        },
        'map-view': {
            // ID контейнера с картой.
            container: 'YMapsID',
            state: {
                center: [37.622093, 55.753994],
                zoom: 9,
                behaviors: ['default', 'scrollZoom']
            },
            options: {}
        }
    },
    map: {
        '*': {
            jquery: 'jquery-private'
        },
        'jquery-private': { jquery: 'jquery' }
    },
    shim: {
        ymaps: {
            exports: 'ymaps'
        },
        /*
        jquery: {
            exports: '$'
        }
        */
    },
    waitSeconds: 0
});

require(['app-ctl'], function (AppCtl) {
    var app = new AppCtl();

    app.init();
});
