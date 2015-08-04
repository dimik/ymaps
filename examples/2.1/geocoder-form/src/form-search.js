ym.modules.define('form-search', [
 'util.defineClass',
 'search-model',
 'form-view',
 'map-view'
], function (provide, defineClass, SearchModel, FormView, MapView) {
  var FormSearch = defineClass(function () {
    this._mapView = new MapView();
    this._searchModel = new SearchModel();
    this._formView = new FormView();
    this._setupListeners();
  }, {
    _setupListeners: function () {
      this._searchModel.events
        .add('requestsuccess', this._onRequestSuccess, this)
        .add('requestfail', this._onRequestFail, this);
      this._formView.events
        .add('requestsubmit', this._onRequestSubmit, this);

      this._mapView.events
        .add('boundschange', this._onMapBoundsChange, this);
    },
    _onRequestSuccess: function (e) {
      this._mapView
        .clear()
        .render(e.get('target').getResult());
    },
    _onRequestFail: function (e) {
      this._formView.showMessage(e.get('target').getError());
    },
    _onRequestSubmit: function (e) {
      this._searchModel.search(e.get('request'));
    },
    _onMapBoundsChange: function (e) {
      var bounds = e.get('target').getBounds();
      this._searchModel.setGeocodeBounds(bounds);
      this._formView.setSuggestBounds(bounds);
    }
  });

  provide(FormSearch);
});
