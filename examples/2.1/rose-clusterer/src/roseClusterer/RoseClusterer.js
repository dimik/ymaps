ymaps.modules.define('RoseClusterer', [
    'util.defineClass',
    'util.extend',
    'Clusterer',
    'GeoObjectCollection'
], function (provide, defineClass, extend, Clusterer, GeoObjectCollection) {

var RoseClusterer = defineClass(
    function (options) {
        RoseClusterer.superclass.constructor.call(this, extend({
            roseRadius: 32,
            gridSize: 128,
            margin: 64,
            hasBalloon: false
        }, options));
    }, Clusterer, {
        createCluster: function (center, geoObjects) {
            var map = this.getMap(),
                zoom = map.getZoom(),
                maxZoom = map.zoomRange.getCurrent()[1];

            if(zoom >= maxZoom) {
                 return this._createCollection(center, geoObjects);
            }

            return RoseClusterer.superclass.createCluster.call(this, center, geoObjects);
        },
        _createCollection: function (center, geoObjects) {
            var collection = new GeoObjectCollection({
                properties: {
                    center: center
                },
                children: geoObjects
            });

            collection.events.once('mapchange', this._onCollectionMapChange, this);

            return collection;
        },
        _onCollectionMapChange: function (e) {
            var collection = e.get('target'),
                center = collection.properties.get('center'),
                num = collection.getLength(),
                radius = this.options.get('roseRadius');

            collection.each(function (geoObject, index) {
                var angle = Math.PI * 2 / num * (num - index),
                    offset = this._getGeoObjectOffset(center, geoObject);

                geoObject.getOverlay()
                    .then(function (overlay) {
                        overlay.options.set('offset', [
                            offset[0] + Math.sin(angle) * radius,
                            offset[1] + Math.cos(angle) * radius
                        ]);
                    });
                console.log(geoObject.balloon.getOverlay() == null && '????????');
            }, this);
        },
        _getGeoObjectOffset: function (center, geoObject) {
            var map = this.getMap(),
                zoom = map.getZoom(),
                projection = map.options.get('projection'),
                pixelCenter = projection.toGlobalPixels(center, zoom),
                coordinates = geoObject.geometry.getCoordinates(),
                pixelCoordinates = projection.toGlobalPixels(coordinates, zoom);

            return [
                pixelCenter[0] - pixelCoordinates[0],
                pixelCenter[1] - pixelCoordinates[1]
            ];
        }
    });

    provide(RoseClusterer);
});
