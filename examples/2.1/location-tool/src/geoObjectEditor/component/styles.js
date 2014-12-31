ym.modules.define('GeoObjectEditor.component.styles', [
    'templateLayoutFactory',
    'option.presetStorage',
    'template.filter.toJSON',
    'template.filter.geometryToBase64'
], function (provide, templateLayoutFactory, presetStorage) {

    var BalloonContentLayout = templateLayoutFactory.createClass([
        '<div style="margin:20px 0">',
            '<form>',
                '<div class="control-group">',
                    '<label class="control-label" for="coordinatesField">Координаты</label>',
                    '<div class="controls">',
                        '{% include options.coordinatesFieldLayout %}',
                    '</div>',
                '</div>',
                '{% if options.encodedCoordinatesFieldLayout %}',
                    '<div class="control-group">',
                        '<label class="control-label" for="encodedCoordinatesField">Base64 координаты</label>',
                        '<div class="controls">',
                            '{% include options.encodedCoordinatesFieldLayout %}',
                        '</div>',
                    '</div>',
                '{% endif %}',
            '</form>',
        '</div>'
    ].join(''));
    var PointCoordinatesFieldLayout = templateLayoutFactory.createClass('<input id="coordinatesField" value="{{ geometry.coordinates|toJSON }}"></input>');
    var LineStringCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="3" id="coordinatesField">{{ geometry.coordinates|toJSON }}</textarea>');
    var PolygonCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="3" id="coordinatesField">{{ geometry.coordinates|toJSON }}</textarea>');
    var EncodedCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="2" id="encodedCoordinatesField">{{ geometry|geometryToBase64 }}</textarea>');

    presetStorage.add('GeoObjectEditor#Point', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: PointCoordinatesFieldLayout
    });
    presetStorage.add('GeoObjectEditor#LineString', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: LineStringCoordinatesFieldLayout,
        balloonEncodedCoordinatesFieldLayout: EncodedCoordinatesFieldLayout
    });
    presetStorage.add('GeoObjectEditor#Polygon', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: PolygonCoordinatesFieldLayout,
        balloonEncodedCoordinatesFieldLayout: EncodedCoordinatesFieldLayout
    });

    provide(presetStorage);
});
