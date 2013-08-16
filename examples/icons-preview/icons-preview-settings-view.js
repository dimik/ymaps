IconsPreview.SettingsView = function (container) {
    this._container = container;
    this.events = $({});

    this._attachHandlers();
};

IconsPreview.SettingsView.prototype = {
    constructor: IconsPreview.SettingsView,
    _attachHandlers: function () {
        this._container
            .on('click', '.btn[data-map-action]', $.proxy(this._onBtnMapActionClick, this))
            .on('click', '.btn[data-load-action]', $.proxy(this._onBtnLoadActionClick, this));
    },
    _detachHandlers: function () {
        this._container
            .off('click');
    },
    _onBtnLoadActionClick: function (e) {
        this.events.trigger($.Event('loadaction', {
            source: $(e.target).attr('data-load-action')
        }));
    },
    _onBtnMapActionClick: function (e) {
        this.events.trigger($.Event('mapaction', {
            action: $(e.target).attr('data-map-action')
        }));
    }
};
