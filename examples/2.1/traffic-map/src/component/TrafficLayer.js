ym.modules.define('TrafficResearch.component.TrafficLayer', [
    'Layer',
    'vow'
], function (provide, Layer, vow) {

    var TrafficLayer = function (tileUrlTemplate, options) {
        return function () {
            var layer = new Layer(tileUrlTemplate, options);

            // Копирайты
            if(options.copyright) {
                layer.getCopyrights = function () {
                    return vow.resolve(options.copyright);
                };
            }

            // Диапазон доступных масштабов на данном слое карты
            if(options.minZoom >= 0 && options.maxZoom >= 0) {
                layer.getZoomRange = function () {
                    return vow.resolve([options.minZoom, options.maxZoom]);
                };
            }

            return layer;
        };
    };

    provide(TrafficLayer);
});
