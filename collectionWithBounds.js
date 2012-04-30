/**
 * @fileOverview
 * This class extends native ymaps.GeoObjectCollection or ymaps.GeoObjectArray
 * with bounds calculation possibility.
 * @example
 *     var collection = new CollectionWithBounds(),
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
 * GeoObjectCollection with bounds calculating.
 * @class
 * @name CollectionWithBounds
 * @augments ymaps.GeoObjectCollection
 * @event ymaps.Event#boundschange Fired with bounds changing.
 */
function CollectionWithBounds () {
    CollectionWithBounds.superclass.constructor.apply(this, arguments);
    this._bounds = null;

    this.events.add('add', function (e) {
        var childBounds = e.get('child').geometry.getBounds(),
            boundsRect = this.getBoundsRect();

        boundsRect && boundsRect.geometry.contains(childBounds[0]) && boundsRect.geometry.contains(childBounds[1]) ||
        (this._updateBounds(childBounds), this.events.fire('boundschange', new ymaps.Event({
            target : this,
            bounds : this._bounds
        }, true)));
    }, this)
    .add('remove', function (e) {
        var childBounds = e.get('child').geometry.getBounds();

        this.getLength() || (this._bounds = null);

        this._bounds &&
           (this._bounds[0][0] <= childBounds[0][0] ||
            this._bounds[0][1] <= childBounds[0][1] ||
            this._bounds[1][0] <= childBounds[1][0] ||
            this._bounds[1][0] <= childBounds[1][0]) &&
        (this._recalculateBounds(), this.events.fire('boundschange', new ymaps.Event({
            target : this,
            bounds : this._bounds
        }, true)));
    }, this);
}

ymaps.util.augment(CollectionWithBounds, ymaps.GeoObjectCollection, /** @lends CollectionWithBounds.prototype */ {
    /**
     * @function
     * @name CollectionWithBounds.getBounds
     * @returns {Array} Represents collection bounds through 2 points array.
     */
    getBounds : function () {
        return this._bounds;
    },
    /**
     * Represents collection bounds through ymaps.Polygon instance.
     * @function
     * @name CollectionWithBounds.getBoundsRect
     * @returns {ymaps.Polygon} Useful in collection bounds visualization on the map.
     */
    getBoundsRect : function () {
        if(!this._bounds) {
            return;
        }

        var lowerCorner = this._bounds[0],
            upperCorner = this._bounds[1],
            rectangle = new ymaps.Polygon([[
                lowerCorner,
                [lowerCorner[0], upperCorner[1]],
                upperCorner,
                [upperCorner[0], lowerCorner[1]]
            ]]);

        return rectangle;
    },
    /**
     * Update collection bounds with child item bounds.
     * @ignore
     * @function
     * @param {Array} childBounds
     */
    _updateBounds : function (childBounds) {
        if(!this._bounds) {
            this._bounds = [[].concat(childBounds[0]), [].concat(childBounds[1])];
            return;
        }

        var lowerCorner = this._bounds[0],
            upperCorner = this._bounds[1];

        lowerCorner.splice(0, 2,
            Math.min(lowerCorner[0], childBounds[0][0]),
            Math.min(lowerCorner[1], childBounds[0][1])
        ),
        upperCorner.splice(0, 2,
            Math.max(upperCorner[0], childBounds[1][0]),
            Math.max(upperCorner[1], childBounds[1][1])
        )
    },
    /**
     * Complete collection bounds recount.
     * @ignore
     * @function
     */
    _recalculateBounds : function () {
        this._bounds = null;
        this.each(function (item) {
            this._updateBounds(item.geometry.getBounds());
        }, this);
    }
});

