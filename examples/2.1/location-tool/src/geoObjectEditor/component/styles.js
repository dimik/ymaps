ym.modules.define('GeoObjectEditor.component.styles', [
    'templateLayoutFactory',
    'option.presetStorage'
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
            '</form>',
        '</div>'
    ].join(''));
    var PointCoordinatesFieldLayout = templateLayoutFactory.createClass('<input id="coordinatesField" value="{{ geometry.coordinates }}"></input>');
    var LineStringCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="3" id="coordinatesField">{{ geometry.coordinates }}</textarea>');
    var PolygonCoordinatesFieldLayout = templateLayoutFactory.createClass('<textarea rows="3" id="coordinatesField">{{ geometry.coordinates }}</textarea>');

    presetStorage.add('GeoObjectEditor#Point', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: PointCoordinatesFieldLayout
    });
    presetStorage.add('GeoObjectEditor#LineString', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: LineStringCoordinatesFieldLayout
    });
    presetStorage.add('GeoObjectEditor#Polygon', {
        balloonContentLayout: BalloonContentLayout,
        balloonCoordinatesFieldLayout: PolygonCoordinatesFieldLayout
    });

    provide(presetStorage);
});
