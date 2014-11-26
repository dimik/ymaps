ymaps.modules.define('RoseClusterer', [
    'util.defineClass',
    'util.extend',
    'Clusterer',
    'GeoObjectCollection'
], function (provide, defineClass, extend, Clusterer, GeoObjectCollection) {

var RoseClusterer = defineClass(
    function (options) {
        RoseClusterer.superclass.constructor.call(
            this,
            extend({
                radius: 30,
                hasBalloon: false
            }, options)
        );
    }, Clusterer, {
        createCluster: function (center, geoObjects) {
            var map = this.getMap(),
                zoom = map.getZoom(),
                maxZoom = map.zoomRange.getCurrent()[1];

            if(zoom >= maxZoom) {
                 return this._createRose(center, geoObjects);
            }
            else {
                return RoseClusterer.superclass.createCluster.call(this, center, geoObjects);
            }
        },
        _createRose: function (center, geoObjects) {
            var map = this.getMap(),
                collection = new GeoObjectCollection(),
                zoom = map.getZoom(),
                projection = map.options.get('projection'),
                pixelCenter = projection.toGlobalPixels(center, zoom),
                num = geoObjects.length,
                radius = this.options.get('radius'),
                getOffset = function (geoObject) {
                    var coordinates = geoObject.geometry.getCoordinates(),
                        pixelCoordinates = projection.toGlobalPixels(coordinates, zoom);

                    return [
                        pixelCenter[0] - pixelCoordinates[0],
                        pixelCenter[1] - pixelCoordinates[1]
                    ];
                };

            map.geoObjects.add(collection);

            geoObjects.forEach(function (geoObject, index) {
                var angle = Math.PI * 2 / num * (num - index),
                    offset = getOffset(geoObject);

                collection.add(geoObject);

                // костыльнах
                setTimeout(function () {
                geoObject.getOverlay()
                    .then(function (overlay) {
                        overlay.options.set('offset', [
                            offset[0] + Math.sin(angle) * radius,
                            offset[1] + Math.cos(angle) * radius
                        ]);
                    }, function (err) {
                        console.log(err);
                    });
                }, 0);
            });

            return collection;
        }
    });

    provide(RoseClusterer);
});
