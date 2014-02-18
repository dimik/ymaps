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
                    //'<div class="well">',
                        '<img src="i/legend-01.png"/>'//,
                    //'</div>'
                    ].join('')
            }, /*{
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
            }, */{
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
                controls: ['zoomControl', 'fullscreenControl']
            },
            options: {
                zoomControlSize: 'small',
                fullscreenControlSize: 'default'
            }
        },
        'legend-map-view': {
            template:
            '<div style="width:240px;' +
                '{% if options.visible == false %}' +
                    'display:none;' +
                '{% endif %}">' +
                '{{ data.content|raw }}' +
            '</div>',
            position: { bottom: 20, right: 5 }
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
