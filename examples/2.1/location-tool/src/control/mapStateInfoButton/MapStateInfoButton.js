ym.modules.define('control.MapStateInfoButton', [
    'control.Button',
    'util.extend'
], function (provide, Button, extend) {
    var defaultOptions = {
        position: {
            right: 10,
            bottom 30
        }
    };
    var defaultData = {
        image: 'i/button-mapinfo.png',
        title: 'Состояние карты'
    };
    var MapStateButton = function (params) {
        params = params || {};
        var button = new Button({
            data: extend(defaultData, params.data),
            options: extend(defaultOptions, params.options)
        });

        return button;
    };

    provide(MapStateInfoButton);
});
