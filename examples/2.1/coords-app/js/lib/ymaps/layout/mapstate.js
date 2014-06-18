ymaps.modules.define('ymaps-layout-mapstate', [
    'templateLayoutFactory'
], function (provide, templateLayoutFactory) {

var MapStateControlLayout = templateLayoutFactory.createClass([
    '<div class="well">',
    '<form class="form-horizontal">',
        '<div class="control-group">',
            '<label class="control-label" for="mapZoom" >Масштаб карты</label>',
            '<div class="controls">',
                '<input type="text" id="mapZoom" value="{{ data.zoom }}">',
            '</div>',
        '</div>',
        '<div class="control-group">',
            '<label class="control-label" for="mapCenter">Центр карты</label>',
            '<div class="controls">',
                '<input type="text" id="mapCenter" value="{{ data.center }}">',
            '</div>',
        '</div>',
    '</form>',
    '</div>'
].join(''));

provide(MapStateControlLayout);

});
