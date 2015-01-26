ym.modules.define('MapStateInfo', [
    'util.defineClass',
    'control.MapStateInfoButton',
    'control.MapStateInfoWindow',
    'control.CrossControl'
], function (provide, defineClass, MapStateInfoButton, MapStateInfoWindow, CrossControl) {

    var MapStateInfo = defineClass(function (map) {
        this._map = map;
        this._buttonControl = new MapStateInfoButton();
        map.controls.add(this._buttonControl);
        this._windowControl = new MapStateInfoWindow();
        this._crossControl = new CrossControl();

        this._setupListeners();
        this._buttonControl.select();
    }, {
        _setupListeners: function () {
            this._buttonControl.events
                .add('select', this._onButtonSelect, this)
                .add('deselect', this._onButtonDeselect, this);
        },
        _onButtonSelect: function () {
            this._map.controls
                .add(this._windowControl, { position: { bottom: 160, right: 230 }})
                .add(this._crossControl);
        },
        _onButtonDeselect: function () {
            this._map.controls
                .remove(this._windowControl)
                .remove(this._crossControl);
        }
    });

    provide(MapStateInfo);
});
