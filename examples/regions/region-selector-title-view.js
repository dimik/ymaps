RegionSelector.TitleView = function (container) {
    this._container = container;
    this._template = '<p><a href="#">%s</a></p>';
    this.events = $({});
};

RegionSelector.TitleView.prototype = {
    constructor: RegionSelector.TitleView,
    render: function (data) {
        var title = data.get('regions').properties.get('hintContent');

        this._container
            .append(this._template.replace('%s', title));
        this._attachHandlers();

        return this;
    },
    clear: function () {
        this._detachHandlers();
        this._container.empty();

        return this;
    },
    _attachHandlers: function () {
        this._container.on('click', 'a', $.proxy(this._onTitleClick, this));
    },
    _detachHandlers: function () {
        this._container.off('click');
    },
    _onTitleClick: function (e) {
        e.preventDefault();

        this.events.trigger($.Event('titleclick'));
    }
};
