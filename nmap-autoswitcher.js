/**
 * @fileOverview
 * Simple layer switcher control for Yandex.Maps API 2.0.
 * Switch between map <-> publicMap layers depends on current map zoom.
 * @example
 * ymaps.ready(function () {
 *     var map = new ymaps.Map('map', {
 *         center: [44.22, 42.06],
 *         zoom: 12,
 *         type: null,
 *         behaviors: ['default', 'scrollZoom']
 *     });
 *
 *     $.getScript('nmap-autoswitcher.js', function () {
 *         var autoSwitcher = new AutoSwitcher();
 *
 *         autoSwitcher.addToMap(map);
 *     });
 * });
 */

var AutoSwitcher = function () {
    var MapLayer = ymaps.layer.storage.get('yandex#map'),
        PublicMapLayer = ymaps.layer.storage.get('yandex#publicMap'),
        SatLayer = ymaps.layer.storage.get('yandex#satellite'),

        /**
         * Fallback if ES5 Function.prototype.bind not supported.
         * @private
         * @function
         * @name bind
         * @param {Function} fn Callback method.
         * @param {Object} ctx Context object.
         * @returns {Function} Same fn with changed context.
         */
        bind = function (fn, ctx) {
            return fn.bind && fn.bind(ctx) || function () {
                return fn.apply(ctx, arguments);
            }
        },

        /**
         * Switch between map/nmap layers depends on current map zoom.
         * @class
         * @name AutoSwitcher
         */
        AutoSwitcher = function () {
            this.currentLayer = null;
            this.map = null;
            this.mapZoomRange = null;
            this.satZoomRange = null;
            this.layers = {
                map: new MapLayer(),
                publicMap: new PublicMapLayer(),
                sat: new SatLayer()
            }
        };

    AutoSwitcher.prototype = {
        constructor: AutoSwitcher,

        /**
         * Add AutoSwitcher control on map.
         * @function
         * @name AutoSwitcher.addToMap
         * @param {Object} map ymaps.Map instance.
         */
        addToMap: function (map) {
            this.map = map;

            this.provider = {
                events: new ymaps.event.Manager(),
                getZoomRange: bind(this.getZoomRange, this)
            };
            map.zoomRange.addProvider(this.provider);

            map.events.add('boundschange', this.update, this);

            this.getZoomRange(map.getCenter()).then(bind(this.update, this));
        },

        /**
         * Remove AutoSwitcher control from map.
         * @function
         * @name AutoSwitcher.removeFromMap
         */
        removeFromMap: function () {
            this.map.events.remove('boundschange', this.update, this);
            this.map.zoomRange.removeProvider(this.provider);
            if (this.currentLayer) {
                this.map.layers.remove(this.currentLayer);
            }
            this.map = null;
        },

        /**
         * Update map layer.
         * @function
         * @name AutoSwitcher.update
         */
        update: function () {
            if (this.map && this.satZoomRange && this.mapZoomRange) {
                this.applyLayers();
            }
        },

        /**
         * Select layer depends on current map zoom.
         * @function
         * @name AutoSwitcher.applyLayers
         */
        applyLayers: function () {
            var zoom = this.map.getZoom(),
                layer = zoom > 12 && this.satZoomRange[1] >= 14 && this.mapZoomRange[1] <= 16 &&
                    'publicMap' || 'map';

            this.switchLayer(this.layers[layer]);
        },

        /**
         * Change current map layer.
         * @function
         * @name AutoSwitcher.switchLayer
         * @param {Object} layer
         */
        switchLayer: function (layer) {
            if (this.currentLayer === layer) {
                return;
            }

            this.currentLayer && this.map.layers.remove(this.currentLayer);
            this.map.layers.add(this.currentLayer = layer);
        },

        /**
         * Get actual zoom range for map center.
         * @function
         * @name AutoSwitcher.getZoomRange
         * @param {Number[]} center Coordinates of the map center.
         * @returns {Object} CommonJS promise.
         */
        getZoomRange: function (center) {
            var zoom = this.map.getZoom(),
                promise = new ymaps.util.Promise(),
                res = {
                    map: null,
                    sat: null
                },
                _this = this,
                onReady = function () {
                    if (res.map && res.sat) {
                        var mapCenter = _this.map.getCenter();
                        if (Math.abs(mapCenter[0] - center[0]) < 1e-6 && Math.abs(mapCenter[1] - center[1]) < 1e-6) {
                            _this.mapZoomRange = res.map;
                            _this.satZoomRange = res.sat;
                            promise.resolve([
                                Math.min(res.map[0], res.sat[0]),
                                Math.max(res.map[1], res.sat[1])
                            ]);
                        }
                    }
                }

            this.layers.map.getZoomRange(center).then(function (mapZoomRange) {
                res.map = mapZoomRange;
                onReady();
            });
            this.layers.sat.getZoomRange(center).then(function (satZoomRange) {
                res.sat = satZoomRange;
                onReady();
            });

            return promise;
        }
    };

    return AutoSwitcher;
}();

