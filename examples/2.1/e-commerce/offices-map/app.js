requirejs.config({
    baseUrl: 'lib',
    paths: {
        ymaps: '//api-maps.yandex.ru/2.1-dev/?lang=ru-RU&load=package.full&coordorder=longlat',
        jquery: '//yandex.st/jquery/2.0.3/jquery.min',
        ready: 'ymaps-ready'
    },
    config: {
        'map-view': {
            // ID контейнера с картой.
            container: 'YMapsID'
        },
        'geoobjects-model': {
            // Урл до файла с данными.
            url: 'data.json'
        }
    },
    map: {
        '*': { 'jquery': 'jquery-private' },
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

require(['offices-map'], function (Offices) {
    var offices = new Offices();

    offices.init();
});
