function ListCollection() {
    ListCollection.superclass.constructor.apply(this, arguments);
    this._list = [];
}

ymaps.ready(function () {
    ymaps.util.augment(ListCollection, ymaps.GeoObjectCollection, {
        get: function (index) {
            return this._list[index];
        },
        add: function (child, index) {
            this.constructor.superclass.add.call(this, child);

            index = index == null ? this._list.length : index;
            this._list[index] = child;

            return this;
        },
        indexOf: function (o) {
            for(var i = 0, len = this._list.length; i < len; i++) {
                if(this._list[i] === o) {
                    return i;
                }
            }

            return -1;
        },
        splice: function (index, number) {
            var added = Array.prototype.slice.call(arguments, 2),
                removed = this._list.splice.apply(this._list, arguments);

            for(var i = 0, len = added.length; i < len; i++) {
                this.add(added[i]);
            }

            for(var i = 0, len = removed.length; i < len; i++) {
                this.remove(removed[i]);
            }

            return removed;
        },
        remove: function (child) {
            this.constructor.superclass.remove.call(this, child);

            // this._list.splice(this.indexOf(child), 1);
            delete this._list[this.indexOf(child)];

            return this;
        },
        removeAll: function () {
            this.constructor.superclass.removeAll.call(this);

            this._list = [];

            return this;
        },
        each: function (callback, context) {
            for(var i = 0, len = this._list.length; i < len; i++) {
                callback.call(context, this._list[i]);
            }
        }
    });
});
