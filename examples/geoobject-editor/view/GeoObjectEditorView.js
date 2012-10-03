var GeoObjectEditorView = (function () {

    var BaseFieldsetMethods = {
        getFieldsValues: function () {
            var result = {};

            this.fields.each(function () {
                result[this.name] = this.value;
            });

            return result;
        },
        setFieldsValues: function () {
            var props = this.fields.map(function () { return this.name; }).get();

            props.forEach(function (prop) {
                var value = this.geoObject.properties.get(prop);

                value && this.fields.filter('[name=' + prop + ']').val(value);
            }, this);
        },
        onFieldsChange: function (e) {
            this.updateGeoObject(this.getFieldsValues());
        },
        updateGeoObject: function (props) {
            var geoObject = this.geoObject;

            geoObject.options.set(props);
            geoObject.properties.set(props);
        },
        clear: function () {
            this.fields.off('change');

            GeoObjectEditorView.getLayout(this.layout).superclass.clear.call(this);
        }
    };

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
                    '<select class="input-xlarge" tabindex="5" name="iconStyle">',
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
                    '<select class="input-xlarge" tabindex="6" name="iconColor">',
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
        ].join(''), ymaps.util.extend({}, BaseFieldsetMethods, {
            build: function () {
                var el = this.getParentElement(),
                    geoObject = this.geoObject = this.getData().geoObject,
                    geometryType = geoObject.geometry.getType();

                this.layout = geometryType + 'Fieldset';

                GeoObjectEditorView.getLayout(this.layout).superclass.build.call(this);

                this.fields = $('[name^=icon]', el)
                    .on('change', $.proxy(this.onFieldsChange, this));

                this.positionField = $('[name=coordinates]', el)
                    .on('change', $.proxy(this.onPositionChange, this));

                this.setFieldsValues();

                if(!geoObject.properties.get('address')) {
                    this.getAddress(geoObject.geometry.getCoordinates(), function (res) {
                        var result = res.geoObjects.get(0),
                            address = result && result.properties.get('text');

                        address && geoObject.properties.set('address', address);
                    });
                }
            },
            clear: function () {
                this.fields.off('change');
                this.positionField.off('change');

                GeoObjectEditorView.getLayout(this.layout).superclass.clear.call(this);
            },
            onPositionChange: function (e) {
                var geoObject = this.geoObject,
                    coordinates = $(e.target).val().split(',');

                geoObject.geometry.setCoordinates(coordinates);
                geoObject.properties.get('balloon').autoPan();
            },
            updateGeoObject: function (props) {
                var geoObject = this.geoObject,
                    geoObjects = geoObject.getParent(),
                    index = geoObjects.indexOf(geoObject),
                    preset = 'twirl#' + props.iconColor + props.iconStyle;

                geoObject.options.set('preset', preset)
                    .unset('iconContentLayout');

                geoObject.properties.set(props);

                switch(props.iconStyle) {
                    case 'StretchyIcon':
                        geoObject.options.set('iconContentLayout', GeoObjectView.getLayout('strechyIconContent'));
                        break;
                    case 'Icon':
                        index++ < 100 && geoObject.properties.set('iconContent', index);
                        break;
                    default:
                        geoObject.properties.unset('iconContent');
                }
            },
            getAddress: function (coordinates, callback) {
                ymaps.geocode(coordinates, { results: 1 })
                    .then(callback);
            }
        })),

        LineStringFieldset: ymaps.templateLayoutFactory.createClass([
            '<div class="control-group">',
                '<label class="control-label">Цвет линии</label>',
                '<div class="controls">',
                    '<input type="text" name="strokeColor" class="input-xlarge" placeholder="FFFFFFAA или rgba(255,0,0,1)" value="$[properties.strokeColor]">',
                '</div>',
            '</div>',
            '<div class="control-group">',
                '<label class="control-label">Толщина линии</label>',
                '<div class="controls">',
                    '<input type="text" name="strokeWidth" class="input-micro" placeholder="1" value="$[properties.strokeWidth]">',
                '</div>',
            '</div>',
            '<div class="control-group">',
                '<label class="control-label">Стиль линии</label>',
                '<div class="controls">',
                    '<select class="input-xlarge" tabindex="6" name="strokeStyle">',
                        '<option value="solid">Сплошная линия</option>',
                        '<option value="dash">Тире</option>',
                        '<option value="dashdot">Длинное тире - короткое тире</option>',
                        '<option value="dot">Точки</option>',
                        '<option value="longdash">Длинные тире</option>',
                        '<option value="longdashdot">Очень длинное тире - точка</option>',
                        '<option value="longdashdotdot">Длинное тире - точка - точка</option>',
                        '<option value="shortdash">Короткие тире</option>',
                        '<option value="shortdashdot">Тире - точка</option>',
                        '<option value="shortdashdotdot">Тире - точка - точка</option>',
                        '<option value="shortdot">Точки через двойной интервал</option>',
                    '</select>',
                '</div>',
            '</div>'
        ].join(''), ymaps.util.extend({}, BaseFieldsetMethods, {
            build: function () {
                var el = this.getParentElement(),
                    geoObject = this.geoObject = this.getData().geoObject,
                    geometryType = geoObject.geometry.getType();

                this.layout = geometryType + 'Fieldset';

                GeoObjectEditorView.getLayout(this.layout).superclass.build.call(this);

                this.fields = $('[name^=stroke]', el)
                    .on('change', $.proxy(this.onFieldsChange, this));

                this.setFieldsValues();
            }
        }))
    };

    return {
        getLayout: function (key) {
            return views[key.charAt(0).toUpperCase() + key.substring(1)];
        }
    };

}());

