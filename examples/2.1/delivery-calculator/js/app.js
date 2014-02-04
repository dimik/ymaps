requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        ymaps: '//api-maps.yandex.ru/2.1-dev/?lang=ru-RU&load=package.full',
        jquery: '//yandex.st/jquery/2.0.3/jquery.min',
        'jquery-tmpl': '//ajax.microsoft.com/ajax/jquery.templates/beta1/jquery.tmpl',
        ready: 'ymaps-ready'
    },
    config: {
        'directions-service': {
            // avoidTrafficJams: true
        },
        'directions-renderer': {
            suppressPolylines: true,
            draggable: true
        },
        'multi-geocoder': {
            kind: 'street'
        },
        'map-view': {
            // ID контейнера с картой.
            container: 'YMapsID',
            state: {
                center: [55.751574, 37.573856],
                zoom: 9,
                behaviors: ['default', 'scrollZoom'],
                controls: []
            },
            options: {}
        },
        'delivery-calculator': {
            origin: 'Москва, Льва Толстого 18',
            tarifs: [{
                id: 'moscow',
                name: 'Москва',
                label: 'Маршрут по Москве',
                color: '#0000ff',
                rate: 500,
                fixed: true,
                url: 'moscow.json'/*,
                contains: function (route) {
                    return route.legs[0].end_address.indexOf('МКАД') > -1 ||
                        this.contains(route.legs[0].end_location);
                }*/
            }, {
                id: 'russia',
                name: 'Россия',
                label: 'Маршрут за МКАД',
                rate: 20,
                color: '#ff0000',
                url: 'russia.json'/*,
                notContains: function (route) {
                    return route.legs[0].end_address.indexOf('МКАД') > -1 ||
                        !this.contains(route.legs[0].end_location);
                }*/
            }]
        },
        'dom-view': {
            container: '#sidebar',
            template: '#sidebarTemplate'
        }
    },
    /*
    map: {
        '*': { jquery: 'jquery-private' },
        'jquery-private': { jquery: 'jquery' }
    },
    */
    shim: {
        ymaps: {
            exports: 'ymaps'
        },
        'jquery-tmpl': {
            deps: ['jquery'],
            exports: 'jQuery.fn.tmpl'
        },
        /*
        jquery: {
            exports: 'jQuery'
        }
        */
    },
    waitSeconds: 0
});

require(['delivery-calculator'], function (DeliveryCalculator) {
    var calculator = new DeliveryCalculator();
});
