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
            gridSize: 256,
            margin: 64,
            hasBalloon: true
        }, options));
    }, Clusterer, {
        createCluster: function (center, geoObjects) {
            var map = this.getMap();
            var zoom = map.getZoom();
            var maxZoom = map.zoomRange.getCurrent()[1];

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
            var collection = e.get('target');
            var map = this.getMap();
            var projection = map.options.get('projection');
            var center = collection.properties.get('center');
            var zoom = map.getZoom();
            var pixelCenter = projection.toGlobalPixels(center, zoom);
            var radius = this.options.get('roseRadius');
            var getGeoObjectOffset = function (geoObject) {
                var pixelCoordinates = projection.toGlobalPixels(
                    geoObject.geometry.getCoordinates(),
                    zoom
                );

                return [
                    pixelCenter[0] - pixelCoordinates[0],
                    pixelCenter[1] - pixelCoordinates[1]
                ];
            };

            collection.each(function (geoObject, index) {
                var num = collection.getLength();
                var angle = Math.PI * 2 / num * (num - index);
                var geoObjectOffset = getGeoObjectOffset(geoObject);
                var offset = [
                    geoObjectOffset[0] + Math.sin(angle) * radius,
                    geoObjectOffset[1] + Math.cos(angle) * radius
                ];

                geoObject.options.set({
                    iconOffset: offset,
                    balloonOffset: offset
                });
            });
        }
    });

    provide(RoseClusterer);
});
