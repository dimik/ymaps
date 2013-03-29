function ObjectManager(options) {
    // Для оптимизации сделаем метки на canvas по-умолчанию.
    var opts = ymaps.util.extend({ overlayFactory: 'default#interactiveGraphics' }, options);

    ObjectManager.superclass.constructor.call(this, null, opts);

    this._zooms = [];
    this._map = null;

    this.events.add('mapchange', this._onMapChange, this);
}

ymaps.ready(function () {
    ymaps.util.augment(ObjectManager, ymaps.GeoObjectArray, {
        add: function (object, minZoom, maxZoom) {
            this.constructor.superclass.add.call(this, object);

            var zoom = this._map && this._map.getZoom(),
                minZoom = minZoom > 0 ? minZoom : 0,
                maxZoom = maxZoom > 0 ? maxZoom : Infinity;

            this._zooms.push({
                minZoom: minZoom,
                maxZoom: maxZoom
            });

            if(zoom >= 0) {
                object.options.set('visible', zoom >= minZoom && zoom <= maxZoom);
            }

            return this;
        },
        remove: function (object) {
            this._zooms.splice(this.indexOf(object), 1);

            this.constructor.superclass.remove.call(this, object);

            return this;
        },
        removeAll: function () {
            this.constructor.superclass.removeAll.call(this);

            this._zooms = [];

            return this;
        },
        _onBoundsChange: function (e) {
            var zoom = e.get('newZoom');

            this.each(function (object, i) {
                var minZoom = this._zooms[i].minZoom,
                    maxZoom = this._zooms[i].maxZoom;

                object.options.set('visible', zoom >= minZoom && zoom <= maxZoom);

            }, this);
        },
        _onMapChange: function (e) {
            var map = e.get('newMap');

            if(this._map != map) {
                this._detachListeners();
                this._attachListeners(map);
            }

            this._map = map;
        },
        _attachListeners: function (map) {
            if(map) {
                map.events.add('boundschange', this._onBoundsChange, this);
            }
        },
        _detachListeners: function () {
            if(this._map) {
                this._map.events.remove('boundschange', this._onBoundsChange, this);
            }
        }
    });
});
