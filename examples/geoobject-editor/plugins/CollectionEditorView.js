define(['ready!ymaps', 'jquery'], function (ymaps, $) {

    var BaseMethods = {
        build: function () {
            views[this.layout].superclass.build.call(this);

            var el = this.getParentElement();

            this.menu = $('.nav', el)
                .on('click', $.proxy(this.onItemClick, this));
        },
        clear: function () {
            this.menu.off('click');

            views[this.layout].superclass.clear.call(this);
        },
        onItemClick: function () {}
    };

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
                this.layout = 'CreateMenu';
                BaseMethods.build.call(this);
            },
            clear: function () {
                BaseMethods.clear.call(this);
            },
            onItemClick: function (e) {
                var geometryType = $(e.target).data('geometry'),
                    collection = this.getData().geoObjects,
                    coordinates = this.getData().coordPosition;

                e.preventDefault();

                switch(geometryType) {
                    case 'LineString':
                        coordinates = [coordinates];
                        break;
                    case 'Polygon':
                        coordinates = [[coordinates, coordinates]];
                        break;
                    case 'Rectangle':
                        coordinates = [coordinates, coordinates];
                }

                console.log(geometryType, coordinates, Array.isArray(coordinates));

                collection.events.fire('actioncreate', {
                    geometry: new ymaps.geometry[geometryType](coordinates),
                    geometryType: geometryType,
                    coordinates: coordinates,
                    target: collection,
                    coordPosition: this.getData().coordPosition
                });
            }
        }),

        EditMenu: ymaps.templateLayoutFactory.createClass([
            '<ul class="nav nav-list">',
                '<li class="nav-header">Действие</li>',
                '<li><a href="#" data-action="edit">Редактировать</a></li>',
                '<li><a href="#" data-action="clone">Редактировать копию</a></li>',
                '<li><a href="#" data-action="delete">Удалить</a></li>',
            '</ul>'
        ].join(''), {
            build: function () {
                this.layout = 'EditMenu';
                BaseMethods.build.call(this);
            },
            clear: function () {
                BaseMethods.clear.call(this);
            },
            onItemClick: function (e) {
                var action = $(e.target).data('action'),
                    geoObject = this.getData().geoObject,
                    collection = this.getData().geoObjects;

                e.preventDefault();

                collection.events.fire('action' + action, {
                    geoObject: geoObject,
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

