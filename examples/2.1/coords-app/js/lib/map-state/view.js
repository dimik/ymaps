ymaps.modules.define('mapstate-view', [
    'inherit',
    'ymaps-map',
    'ymaps-control-mapstate',
    'ymaps-layout-mapstate'
], function (provide, inherit, map, MapStateControl, MapStateControlLayout) {

var MapStateView = inherit({
    __constructor: function () {
        this._control = new MapStateControl({
            options: {
                contentLayout: MapStateControlLayout
            }
        });
        map.controls.add(this._control);
    },
    render: function (data) {
        this._control.data.set(data);
    }
});

provide(MapStateView);

});
