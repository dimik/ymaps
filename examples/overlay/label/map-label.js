function MapLabel(position) {
    this._overlay = this._createOverlay(position);
}

MapLabel.prototype = {
    constructor: MapLabel,
    setMap: function (map) {
        this._overlay.options.setParent(map && map.options);
        this._overlay.setMap(map);

        this._$el = $(this._overlay.getElement())
            .css({ opacity: 0 });

        return this;
    },
    getContent: function () {
        return this._overlay.getData().content;
    },
    setContent: function (content) {
        this._overlay.setData({ content: content });

        return this;
    },
    _createOverlay: function (position) {
        return new ymaps.overlay.html.Label(this._createGeometry(position), {}, {
            layout: 'twirl#label',
            contentLayout: 'twirl#labelContent',
            visible: false
        });
    },
    setPosition: function (position) {
        this._overlay = this._createOverlay(position);
    },
    _createGeometry: function (position) {
        return new ymaps.geometry.pixel.Point(position);
    },
    show: function (speed, fn) {
        this._$el
            .animate({ opacity: 1 }, speed, fn);

        return this;
    },
    hide: function (speed, fn) {
        this._$el
            .animate({ opacity: 0 }, speed, fn);

        return this;
    }
};
