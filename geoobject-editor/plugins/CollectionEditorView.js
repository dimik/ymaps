define(['ready!ymaps', 'jquery'], function (ymaps, $) {

    var views = {
        CreateMenu: ymaps.templateLayoutFactory.createClass([
            '<ul class="nav nav-list">',
                '<li class="nav-header">Создать</li>',
                '<li><a href="#" data-geometry="Point">Метку</a></li>',
                '<li><a href="#" data-geometry="LineString">Ломаную линию</a></li>',
                '<li><a href="#" data-geometry="Polygon">Многоугольник</a></li>',
                '<li><a href="#" data-geometry="Rectangle">Прямоугольник</a></li>',
                '<li><a href="#" data-geometry="Circle">Круг</a></li>',
            '</ul>'
        ].join(''), {
            build: function () {
                views['CreateMenu'].superclass.build.call(this);

                var el = this.getParentElement();

                this.menu = $('.nav', el)
                    .on('click', $.proxy(this.onItemClick, this));
            },
            clear: function () {
                this.menu.off('click');

                views['CreateMenu'].superclass.clear.call(this);
            },
            onItemClick: function (e) {
                var target = $(e.target),
                    geometryType = target.data('geometry'),
                    collection = this.getData().geoObjects,
                    coordPosition = this.getData().coordPosition,
                    center = coordPosition.map(function (i) { return i.toFixed(6); }),
                    geometry;

                e.preventDefault();

                switch(geometryType) {
                    case 'LineString':
                        geometry = { type: geometryType, coordinates: [coordPosition] };
                        break;
                    case 'Polygon':
                        geometry = { type: geometryType, coordinates: [[coordPosition, coordPosition]] };
                        break;
                    case 'Rectangle':
                        geometry = { type: geometryType, coordinates: [coordPosition, coordPosition] };
                        break;
                    case 'Circle':
                        geometry = new ymaps.geometry.Circle(coordPosition);
                        break;
                    default:
                        geometry = { type: geometryType, coordinates: coordPosition };
                }

                collection.events.fire('geoobjectcreate', {
                    geoObject: new ymaps.GeoObject({
                        geometry: geometry,
                        properties: { center: center }
                    }),
                    target: collection
                });
            }
        })
    };

    function CollectionEditorView() {}

    (function () {
        this.getLayout = function (key) {
            return views[key.charAt(0).toUpperCase() + key.substring(1)];
        };
    }).call(CollectionEditorView.prototype);

    return CollectionEditorView;
});

