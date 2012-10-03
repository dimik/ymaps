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

var GeoObjectEditorView = (function () {

    var views = {
        EditForm: ymaps.templateLayoutFactory.createClass([
            '<form class="form-horizontal" style="padding-top: 15px">',
                '<fieldset>',
                    // '<legend>$[properties.editor.legend]</legend>',
                    '<div class="control-group">',
                        '<label class="control-label">Название</label>',
                        '<div class="controls">',
                            '<input class="input-xlarge" type="text" name="name" tabindex="1" placeholder="Название объекта" value="$[properties.name]"/>',
                        '</div>',
                    '</div>',
                    '<div class="control-group">',
                        '<label class="control-label">Описание</label>',
                        '<div class="controls">',
                            '<textarea rows="3" class="input-xlarge" name="description" tabindex="2" placeholder="Описание объекта">$[properties.description]</textarea>',
                        '</div>',
                    '</div>',
                    '$[[options.fieldsetLayout]]',
                    '$[[options.actionsLayout]]',
                '</fieldset>',
            '</form>'
        ].join(''), {
            build: function () {
                GeoObjectEditorView.getLayout('editForm').superclass.build.call(this);

                var el = this.getParentElement(),
                    geoObject = this.geoObject = this.getData().geoObject;

                this.form = $('form', el)
                    .on('submit', $.proxy(this.onSubmit, this));

                this.fields = $('[name=name],[name=description]', el)
                    .on('change', $.proxy(this.onChange, this));
            },
            clear: function () {
                this.form.off('submit');
                this.fields.off('change');

                GeoObjectEditorView.getLayout('editForm').superclass.clear.call(this);
            },
            onChange: function (e) {
                var field = $(e.target);

                this.geoObject.properties.set(field.attr('name'), field.val());
            },
            onSubmit: function (e) {
                e.preventDefault();

                this.geoObject.balloon.close();
                this.geoObject.options.set('balloonContentBodyLayout', GeoObjectView.getLayout('balloonContent'));
            }
        }),

        EditFormActions: ymaps.templateLayoutFactory.createClass([
            '<div class="form-actions" style="margin: 0 -15px 0 -15px">',
                '<button type="submit" class="btn btn-primary">Сохранить</button>',
                '<button type="reset" class="btn" style="margin-left: 10px">Отменить</button>',
            '</div>'
        ].join(''), {
            build: function () {
                GeoObjectEditorView.getLayout('editFormActions').superclass.build.call(this);

                var el = this.getParentElement(),
                    geoObject = this.geoObject = this.getData().geoObject;

                this.reset = $('[type=reset]', el)
                    .on('click', $.proxy(this.onCancel, this));
            },
            clear: function () {
                this.reset.off('click');

                GeoObjectEditorView.getLayout('editFormActions').superclass.clear.call(this);
            },
            onCancel: function (e) {
                e.preventDefault();

                this.geoObject.setParent(null);
            }
        }),

        PointFieldset: ymaps.templateLayoutFactory.createClass([
            '<div class="control-group">',
                '<label class="control-label">Координаты</label>',
                '<div class="controls">',
                    '<input class="input-xlarge" type="text" name="coordinates" tabindex="3" value="$[geometry.coordinates]"/>',
                '</div>',
            '</div>',
            '<div class="control-group">',
                '<label class="control-label">Адрес</label>',
                '<div class="controls">',
                    '<input class="input-xlarge" type="text" name="address" tabindex="4" placeholder="Адрес объекта" value="$[properties.address]"/>',
                '</div>',
            '</div>',
            '<div class="control-group">',
                '<label class="control-label">Тип иконки</label>',
                '<div class="controls">',
                    '<select class="input-xlarge" tabindex="5" name="iconstyle">',
                        '<option value="Icon">Метки без содержимого</option>',
                        '<option value="DotIcon">Метки без содержимого с точкой в центре</option>',
                        '<option value="StretchyIcon">Метки с текстом (иконки тянутся под контент)</option>',
                        // '<option value="standart">Стандартные значки (пиктограммы)</option>',
                    '</select>',
                '</div>',
            '</div>',
            '<div class="control-group">',
                '<label class="control-label">Цвет иконки</label>',
                '<div class="controls">',
                    '<select class="input-xlarge" tabindex="6" name="iconcolor">',
                        '<option value="blue">Синий</option>',
                        '<option value="darkblue">Темно-синий</option>',
                        '<option value="green">Зеленый</option>',
                        '<option value="darkgreen">Темно-зеленый</option>',
                        '<option value="orange">Оранжевый</option>',
                        '<option value="darkorange">Темно-оранжевый</option>',
                        '<option value="pink">Розовый</option>',
                        '<option value="red">Красный</option>',
                        '<option value="yellow">Желтый</option>',
                        '<option value="brown">Коричневый</option>',
                        '<option value="violet">Фиолетовый</option>',
                        '<option value="night">Цвет ночи</option>',
                        '<option value="white">Белый</option>',
                        '<option value="grey">Серый</option>',
                        '<option value="black">Черный</option>',
                    '</select>',
                '</div>',
            '</div>'
        ].join(''), {
            build: function () {
                GeoObjectEditorView.getLayout('pointFieldset').superclass.build.call(this);

                var el = this.getParentElement(),
                    geoObject = this.geoObject = this.getData().geoObject;

                this.iconStyleField = $('[name=iconstyle]', el)
                    .on('change', $.proxy(this.onIconChange, this));

                this.iconColorField = $('[name=iconcolor]', el)
                    .on('change', $.proxy(this.onIconChange, this));

                this.coordField = $('[name=coordinates]', el)
                    .on('change', $.proxy(this.onCoordChange, this));

                if(geoObject.properties.get('iconStyle')) {
                    this.updateIconFields();
                }
                else {
                    this.iconStyleField.change();
                }

                if(!geoObject.properties.get('address')) {
                    this.getAddress(geoObject.geometry.getCoordinates(), function (res) {
                        var result = res.geoObjects.get(0),
                            address = result && result.properties.get('text');

                        if(result) {
                            geoObject.properties.set('address', address);
                        }
                    });
                }
            },
            clear: function () {
                this.iconStyleField.off('change');
                this.iconColorField.off('change');
                this.coordField.off('change');

                GeoObjectEditorView.getLayout('pointFieldset').superclass.clear.call(this);
            },
            updateIconFields: function () {
                var props = this.geoObject.properties,
                    style = props.get('iconStyle'),
                    color = props.get('iconColor');

                this.iconStyleField.find('option[value=' + style + ']').attr('selected', 'selected');
                this.iconColorField.find('option[value=' + color + ']').attr('selected', 'selected');
            },
            onIconChange: function (e) {
                var style = this.iconStyleField.find('option:selected').val(),
                    color = this.iconColorField.find('option:selected').val();

                this.updateIcon(style, color);
            },
            onCoordChange: function (e) {
                var coordinates = $(e.target).val().split(',');

                this.geoObject.geometry.setCoordinates(coordinates);
            },
            updateIcon: function (style, color) {
                var geoObject = this.geoObject,
                    geoObjects = geoObject.getParent(),
                    index = geoObjects.indexOf(geoObject),
                    preset = 'twirl#' + color + style,
                    opts = geoObject.options, props = geoObject.properties;

                opts.set('preset', preset)
                    .unset('iconContentLayout');

                props.set({
                    iconStyle: style,
                    iconColor: color
                });

                switch(style) {
                    case 'StretchyIcon':
                        opts.set('iconContentLayout', GeoObjectView.getLayout('strechyIconContent'));
                        break;
                    case 'Icon':
                        index++ < 100 && props.set('iconContent', index);
                        break;
                    default:
                        props.unset('iconContent');
                }
            },
            getAddress: function (coordinates, callback) {
                ymaps.geocode(coordinates, { results: 1 })
                    .then(callback);
            }
        })
    };

    return {
        getLayout: function (key) {
            return views[key.charAt(0).toUpperCase() + key.substring(1)];
        }
    };

}());

var GeoObjectView = (function () {

    var views = {
        EditMenu: ymaps.templateLayoutFactory.createClass([
            '<ul class="nav nav-list">',
                '<li><a href="#" data-action="edit">Редактировать</a></li>',
                '<li><a href="#" data-action="clone">Редактировать копию</a></li>',
                '<li><a href="#" data-action="delete">Удалить</a></li>',
            '</ul>'
        ].join('')),

        StrechyIconContent: ymaps.templateLayoutFactory.createClass('<span>$[properties.name]</span>'),

        BalloonContent: ymaps.templateLayoutFactory.createClass([
            '<div>',
                '<h3>$[properties.name]</h3>',
                '<p class="lead">$[properties.description]</p>',
                '[if properties.address]<address>$[properties.address]</address>[endif]',
            '</div>'
        ].join(''))
    };

    return {
        getLayout: function (key) {
            return views[key.charAt(0).toUpperCase() + key.substring(1)];
        }
    };

}());

