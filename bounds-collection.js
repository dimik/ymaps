/**
 * @fileOverview
 * This class extends native ymaps.GeoObjectCollection or ymaps.GeoObjectArray
 * with bounds calculation possibility.
 * @example
 *     var collection = new GeoCollectionBounds(),
 *         placemark1 = new ymaps.Placemark([55.7, 37.5]),
 *         placemark2 = new ymaps.Placemark([55.8, 37.6]),
 *         placemark3 = new ymaps.Placemark([55.5, 37.7]),
 *         polygon = new ymaps.Polygon([[[55,37], [58,36], [54,45], [50, 30]]]);
 *
 *     collection
 *         .add(placemark1)
 *         .add(placemark2)
 *         .add(placemark3)
 *         .add(polygon);
 *
 *     map.geoObjects.add(collection);
 *     // Show collection bounds on the map.
 *     map.geoObjects.add(collection.getBoundsRect());
 *     // Set center and zoom using collection bounds.
 *     map.setBounds(collection.getBounds());
 *
 *     // Fired if item is added or removed from collection
 *     // and if it's geometry are beyond the scope of collection bounds.
 *     collection.events.add('boundschange', function (e) {
 *         console.log(e.get('bounds')); // new bounds value
 *     });
 *
 *     collection.add(new ymaps.Placemark([40, 25])); // Fire the 'boundschange' event on the collection instance.
 */

/**
 * Encapsulates bounds calculating methods.
 * @class
 * @name GeoBounds
 * @param {Array} [lowerCorner] Bottom left corner of the area.
 * @param {Array} [upperCorner] Top right corner of the area.
 */
function GeoBounds(lowerCorner, upperCorner) {
    this.setBounds([lowerCorner, upperCorner]);
}

GeoBounds.prototype = {
    constructor : GeoBounds,
    /**
     * Bounds getter.
     * @function
     * @name GeoBounds.getBounds
     * @returns {Array} Forms bounds and return it.
     */
    getBounds : function () {
        return Array.isArray(this._lower) && Array.isArray(this._upper) ? [this._lower, this._upper] : null;
    },
    /**
     * Bounds setter.
     * @function
     * @name GeoBounds.setBounds
     * @param {Array} bounds
     */
    setBounds : function (bounds) {
        if(Array.isArray(bounds)) {
            this._lower = Array.isArray(bounds[0]) && bounds[0].slice(0);
            this._upper = Array.isArray(bounds[1]) && bounds[1].slice(0);
        }
    },
    /**
     * Checks whether a point is contained in the bounds area.
     * @function
     * @name GeoBounds.contains
     * @param {Array} point GoePoint GeoJSON geometry representation.
     * @returns {Boolean}
     */
    contains : function (point) {
        var bounds = this.getBounds();

        return !!bounds &&
            bounds[0][0] <= point[0] &&
            bounds[0][1] <= point[1] &&
            bounds[1][0] >= point[0] &&
            bounds[1][1] >= point[1];
    },
    /**
     * Update bounds with other bounds.
     * @function
     * @name GeoBounds.update
     * @param {Array} bounds
     */
    update : function (bounds) {
        if(!this.getBounds()) {
            this.setBounds(bounds);
            return;
        }

        var lowerCorner = this._lower;
            upperCorner = this._upper;

        if(Array.isArray(lowerCorner) && Array.isArray(upperCorner)) {
            lowerCorner.splice(0, 2,
                Math.min(lowerCorner[0], bounds[0][0]),
                Math.min(lowerCorner[1], bounds[0][1])
            ),
            upperCorner.splice(0, 2,
                Math.max(upperCorner[0], bounds[1][0]),
                Math.max(upperCorner[1], bounds[1][1])
            )
        }
    },
};

/**
 * GeoObjectCollection with bounds calculating.
 * @class
 * @name GeoCollectionBounds
 * @augments ymaps.GeoObjectCollection
 * @event ymaps.Event#boundschange Fired with bounds changing.
 */
function GeoCollectionBounds() {
    GeoCollectionBounds.superclass.constructor.apply(this, arguments);
    this._bounds = new GeoBounds();

    this.events.add('add', function (e) {
        var childBounds = e.get('child').geometry.getBounds();

         this._bounds.contains(childBounds[0]) && this._bounds.contains(childBounds[1]) ||
        (this._bounds.update(childBounds), this.events.fire('boundschange', {
            target : this,
            bounds : this._bounds.getBounds()
        }, true));
    }, this)
    .add('remove', function (e) {
        var childBounds = e.get('child').geometry.getBounds();

        this.getLength() || (this._bounds = new GeoBounds());

        var bounds = this._bounds.getBounds();

        bounds &&
           (bounds[0][0] <= childBounds[0][0] ||
            bounds[0][1] <= childBounds[0][1] ||
            bounds[1][0] <= childBounds[1][0] ||
            bounds[1][0] <= childBounds[1][0]) &&
        (this._recalculateBounds(), this.events.fire('boundschange', {
            target : this,
            bounds : bounds
        }, true));
    }, this);
}

ymaps.util.augment(GeoCollectionBounds, ymaps.GeoObjectCollection, /** @lends GeoCollectionBounds.prototype */ {
    /**
     * @function
     * @name GeoCollectionBounds.getBounds
     * @returns {Array} Represents collection bounds through 2 points array.
     */
    getBounds : function () {
        var bounds = this._bounds.getBounds();

        return bounds && [bounds[0].slice(0), bounds[1].slice(0)];
    },
    /**
     * Represents collection bounds through ymaps.Polygon instance.
     * @function
     * @name GeoCollectionBounds.getBoundsRect
     * @returns {ymaps.Polygon} Useful in collection bounds visualization on the map.
     */
    getBoundsRect : function () {
        var bounds = this._bounds.getBounds();

        if(!bounds) {
            return;
        }

        var lowerCorner = bounds[0],
            upperCorner = bounds[1],
            rectangle = new ymaps.Polygon([[
                lowerCorner,
                [lowerCorner[0], upperCorner[1]],
                upperCorner,
                [upperCorner[0], lowerCorner[1]]
            ]]);

        return rectangle;
    },
    /**
     * Complete collection bounds recount.
     * @ignore
     * @function
     */
    _recalculateBounds : function () {
        this._bounds = new GeoBounds();
        this.each(function (item) {
            this._bounds.update(item.geometry.getBounds());
        }, this);
    }
});

