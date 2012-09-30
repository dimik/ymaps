var GeoObjectCollectionView = (function () {

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
                GeoObjectCollectionView.getLayout('createMenu').superclass.build.call(this);

                var el = this.getParentElement();

                this.menu = $('.nav', el)
                    .on('click', $.proxy(this.onItemClick, this));
            },
            clear: function () {
                this.menu.off('click');

                GeoObjectCollectionView.getLayout('createMenu').superclass.clear.call(this);
            },
            onItemClick: function (e) {
                var target = $(e.target),
                    geometry = target.data('geometry'),
                    geoObjects = this.getData().geoObjects,
                    coordinates = this.getData().coordPosition;

                e.preventDefault();

                switch(geometry) {
                    case 'LineString':
                        coordinates = [coordinates];
                        break;
                    case 'Polygon':
                        coordinates = [[coordinates, coordinates]];
                        break;
                    case 'Rectangle':
                        coordinates = [coordinates, coordinates];
                        break;
                }

                geoObjects.events.fire('geoobjectcreated', {
                    geoObject: new ymaps.GeoObject({
                        geometry: { type: geometry, coordinates: coordinates }
                    }),
                    target: geoObjects
                });

                geoObjects.balloon.close();
            }
        })
    };

    return {
        getLayout: function (key) {
            return views[key.charAt(0).toUpperCase() + key.substring(1)];
        }
    };

}());

