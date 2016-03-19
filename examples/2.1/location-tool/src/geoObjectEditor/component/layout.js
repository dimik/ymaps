ym.modules.define('GeoObjectEditor.component.styles', [
    'templateLayoutFactory',
    'util.bind',
    'option.presetStorage',
    'template.filter.geometry.json',
    'template.filter.geometry.base64',
    'template.filter.geometry.bounds'
], function (provide, templateLayoutFactory, bind, presetStorage) {

    var BalloonContentLayout = templateLayoutFactory.createClass([
        '<div style="margin:20px 0">',
            '<form>',
                '<div class="control-group">',
                    '<label class="control-label" for="coordinatesField">Координаты</label>',
                    '<div class="controls">',
                        '{% include options.coordinatesFieldLayout %}',
                    '</div>',
                '</div>',
                '{% if options.boundingBoxFieldLayout %}',
                    '<div class="control-group">',
                        '<label class="control-label" for="boundingBoxField">Область</label>',
                        '<div class="controls">',
                            '{% include options.boundingBoxFieldLayout %}',
                        '</div>',
                    '</div>',
                '{% endif %}',
                '{% if options.encodedCoordinatesFieldLayout %}',
                    '<div class="control-group">',
                        '<label class="control-label" for="encodedCoordinatesField">Base64 координаты</label>',
                        '<div class="controls">',
                            '{% include options.encodedCoordinatesFieldLayout %}',
                        '</div>',
                    '</div>',
                '{% endif %}',
                '<div class="form-actions">',
                    '{% if state.editing %}',
                        '<button class="btn btn-warning">Завершить</button>&nbsp;',
                    '{% else %}',
                        '<button type="submit" class="btn btn-success">Редактировать</button>&nbsp;',
                    '{% endif %}',
                    '<button type="reset" class="btn btn-danger">Удалить</button>',
                '</div>',
            '</form>',
        '</div>'
    ].join(''), {
        build: function () {
            BalloonContentLayout.superclass.build.apply(this, arguments);

            this._$element = jQuery(this.getParentElement());
            this._geoObject = this.getData().geoObject;
            this._setupListeners();
        },
        clear: function () {
            this._clearListeners();

            BalloonContentLayout.superclass.clear.apply(this, arguments);
        },
        _setupListeners: function () {
            this._$element
                .on('submit', bind(this._onStartEditing, this))
                .on('reset', bind(this._onRemove, this))
                .on('click', '.btn-warning', bind(this._onStopEditing, this));
        },
        _clearListeners: function () {
            this._$element.off();
        },
        _onStartEditing: function (e) {
            e.preventDefault();

            this._geoObject.editor.startEditing();
            this.events.fire('userclose');
        },
        _onRemove: function (e) {
            e.preventDefault();

            this._geoObject.getParent().remove(this._geoObject);
        },
        _onStopEditing: function (e) {
            e.preventDefault();

            this._geoObject.editor.stopEditing();
        }
    });
    var PointCoordinatesFieldLayout = templateLayoutFactory.createClass('<input id="coordinatesField" class="span4" value="{{ geometry|geometry#json }}"></input>');
    var LineStringCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="2" id="coordinatesField">{{ geometry|geometry#json }}</textarea>');
    var PolygonCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="2" id="coordinatesField">{{ geometry|geometry#json }}</textarea>');
    var EncodedCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="2" id="encodedCoordinatesField">{{ geometry|geometry#base64 }}</textarea>');
    var BoundingBoxFieldLayout = templateLayoutFactory.createClass('<input id="boundingBoxField" class="span4" value="{{ geometry|geometry#bounds }}"></input>');

    presetStorage.add('GeoObjectEditor#Point', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: PointCoordinatesFieldLayout
    });
    presetStorage.add('GeoObjectEditor#LineString', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: LineStringCoordinatesFieldLayout,
        balloonEncodedCoordinatesFieldLayout: EncodedCoordinatesFieldLayout,
        balloonBoundingBoxFieldLayout: BoundingBoxFieldLayout
    });
    presetStorage.add('GeoObjectEditor#Polygon', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: PolygonCoordinatesFieldLayout,
        balloonBoundingBoxFieldLayout: BoundingBoxFieldLayout
    });

    provide(presetStorage);
});
