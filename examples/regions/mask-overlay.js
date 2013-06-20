function MaskOverlay(geometry, data, options) {
    MaskOverlay.superclass.constructor.call(this, geometry, data, options);
}

ymaps.ready(function () {
    ymaps.util.augment(MaskOverlay, ymaps.overlay.staticGraphics.Polygon, {
        constructor: MaskOverlay,
        setGeometry: function (geometry) {
            MaskOverlay.superclass.setGeometry.call(
                this,
                this.getMap() ? this._createGeometry(geometry) : geometry
            );
        },
        _createGeometry: function (geometry) {
            var lineCoordinates = geometry.getCoordinates().slice(0),
                map = this.getMap(),
                center = map.getGlobalPixelCenter(),
                size = map.container.getSize(),
                d = 512;

            lineCoordinates.push([
                [center[0] - size[0] - d, center[1] - size[1] - d],
                [center[0] + size[0] + d, center[1] - size[1] - d],
                [center[0] + size[0] + d, center[1] + size[1] + d],
                [center[0] - size[0] - d, center[1] + size[1] + d],
                [center[0] - size[0] - d, center[1] - size[1] - d]
            ]);

            return new ymaps.geometry.pixel.Polygon(lineCoordinates, 'evenOdd');
        }
    });
});
