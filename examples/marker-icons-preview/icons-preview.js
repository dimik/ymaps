function IconsPreview(map) {
    this._model = new IconsPreview.Model();
    this._modalView = new IconsPreview.ModalView($('.modal'));
    this._settingsView = new IconsPreview.SettingsView($('.btn-toolbar'));
    this._mapView = new IconsPreview.MapView(map);

    this._mapView.render();
    this._attachHandlers();
}

IconsPreview.prototype = {
    constructor: IconsPreview,
    _attachHandlers: function () {
        this._model.events
            .on('requestsuccess', $.proxy(this._onData, this))
            .on('requestfailed', $.proxy(this._onError, this));

        this._settingsView.events
            .on('mapaction', $.proxy(this._onMapAction, this))
            .on('loadaction', $.proxy(this._onLoadAction, this));

        this._modalView.events
            .on('styleselected', $.proxy(this._onStyleSelected, this));
    },
    _detachHandlers: function () {
        this._modalView.events
            .off('styleselected');

        this._settingsView.events
            .off('loadaction')
            .off('mapaction');

        this._model.events
            .off('requestfailed')
            .off('requestsuccess');
    },
    _onData: function (e) {
        this._modalView
            .clear()
            // .render(this._model.getResults());
            .render(e.results)
            .showModal();
    },
    _onError: function (e) {
        if(window.console) {
            // console.log(this._model.getError());
            console.log(e.message);
        }
    },
    _onLoadAction: function (e) {
        this._model
            .load(e.source)
    },
    _onMapAction: function (e) {
        this._mapView[ e.action ]();
    },
    _onStyleSelected: function (e) {
        this._modalView
            .hideModal();

        this._mapView
            .render(e);
    }
};
