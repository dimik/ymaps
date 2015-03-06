ym.modules.define('PieChartClusterer.icon.params', [
    'shape.Circle',
    'geometry.pixel.Circle'
], function (provide, CircleShape, PixelCircleGeometry) {
    provide({
        icons: {
            small: {
                size: [46, 46],
                offset: [-23, -23],
                shape: new CircleShape(new PixelCircleGeometry([0, 2], 21.5))
            },
            medium: {
                size: [58, 58],
                offset: [-29, -29],
                shape: new CircleShape(new PixelCircleGeometry([0, 2], 27.5))
            },
            large: {
                size: [71, 71],
                offset: [-35.5, -35.5],
                shape: new CircleShape(new PixelCircleGeometry([0, 2], 34))
            }
        },
        numbers: [10, 100]
    });
});
