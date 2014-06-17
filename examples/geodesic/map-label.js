function MapLabel(position) {
    this._overlay = this._createOverlay(position);
}

MapLabel.prototype = {
    constructor: MapLabel,
    setMap: function (map) {
        this._overlay.options.setParent(map && map.options);
        this._overlay.setMap(map);

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
            contentLayout: 'twirl#labelContent'
        });
    },
    setPosition: function (position) {
        this._overlay.setGeometry(this._createGeometry(position));
    },
    _createGeometry: function (position) {
        return new ymaps.geometry.pixel.Point(position);
    },
    show: function (speed) {
        $(this._overlay.getElement()).children().eq(0)
            .fadeIn(speed);
    },
    hide: function (speed) {
        $(this._overlay.getElement()).children().eq(0)
            .fadeOut(speed);
    }
};
