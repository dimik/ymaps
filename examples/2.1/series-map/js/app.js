requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        ymaps: '//api-maps.yandex.ru/2.1-dev/?lang=ru-RU&load=package.full&mode=debug',
        jquery: '//yandex.st/jquery/2.0.3/jquery.min',
        ready: 'ymaps-ready'
    },
    config: {
        'series-ctl': {
            layers: [{
                "id": "countries",
                "title": "страны производства сериалов",
                "tileUrlTemplate": "countries/%z/%x-%y.png",
                "notFoundTile": "http://company.yandex.ru/i/researches/2013/music_ua/notFound.png",
                "isTransparent": true,
                "layerMaxZoom": 5,
                "layerMinZoom": 3,
                "legend": [
                    '<div class="well">',
                        'Яна Рудковская ответила фигуристу Алексею Ягудину, который заявил, что ему поступили угрозы от людей из окружения Евгения Плющенко. В частности, Рудковская отметила, что Ягудин стал жертвой телефонных хулиганов.',
                    '</div>'
                    ].join('')
            }, {
                "id": "popularity",
                "title": "популярность сериалов",
                "tileUrlTemplate": "popularity/%z/%x-%y.png",
                "notFoundTile": "http://company.yandex.ru/i/researches/2013/music_ua/notFound.png",
                "isTransparent": true,
                "layerMaxZoom": 5,
                "layerMinZoom": 3,
                "legend": [
                    '<div class="well">',
                        'Яна Рудковская ответила фигуристу Алексею Ягудину, который заявил, что ему поступили угрозы от людей из окружения Евгения Плющенко.',
                    '</div>'
                    ].join('')
            }, {
                "id": "men-women",
                "title": "мужские и женские сериалы",
                "tileUrlTemplate": "men-women/%z/%x-%y.png",
                "notFoundTile": "http://company.yandex.ru/i/researches/2013/music_ua/notFound.png",
                "isTransparent": true,
                "layerMaxZoom": 5,
                "layerMinZoom": 3
            }]
        },
        'map-view': {
            container: 'YMapsID',
            state: {
                center: [0, 0],
                zoom: 3,
                behaviors: ['scrollZoom'],
                controls: ['zoomControl']
            }
        },
        'legend-map-view': {
            layout: '<div style="width:400px">$[data.content]</div>',
            position: { bottom: 10, right: 5 }
        }
    },
    map: {
        '*': { jquery: 'jquery-private' },
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

require(['series-ctl'], function (SeriesCtl) {
    var series = new SeriesCtl();
});
