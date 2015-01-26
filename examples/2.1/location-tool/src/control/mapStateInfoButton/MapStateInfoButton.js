ym.modules.define('control.MapStateInfoButton', [
    'control.Button',
    'util.extend'
], function (provide, Button, extend) {
    var defaultOptions = {
        position: {
            right: 10,
            bottom: 64
        }
    };
    var defaultData = {
        image: 'i/button-mapstate.png',
        title: 'Состояние карты'
    };
    var MapStateInfoButton = function (params) {
        params = params || {};
        var button = new Button({
            data: extend(defaultData, params.data),
            options: extend(defaultOptions, params.options)
        });

        return button;
    };

    provide(MapStateInfoButton);
});
