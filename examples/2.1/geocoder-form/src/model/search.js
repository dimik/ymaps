ym.modules.define('search-model', [
  'util.defineClass',
  'util.extend',
  'event.Manager',
  'geocode',
  'vow'
], function (provide, defineClass, extend, EventManager, geocode, vow) {
  var defaultOptions = {
    results: 1
  };
  var SearchModel = defineClass(function (options) {
    this.events = new EventManager({ context: this });
    this._options = extend({}, defaultOptions, options);
    this._result = null;
    this._error = null;
  }, {
    search: function (request) {
      (request.length?
        (
          this.events.fire('requestsend', {
            request: request
          }),
          geocode(request, this._options)
        ) : vow.reject(new Error('Задан пустой поисковый запрос'))
      )
      .then(this._onRequestSuccess, this)
      .fail(this._onRequestFail, this);
    },
    clear: function () {
      this._result = null;
      this._error = null;
    },
    _onRequestSuccess: function (res) {
      var result = this._result = res.geoObjects.get(0);
      if(!result) {
        throw new Error('По запросу "' + res.metaData.geocoder.request + '" ничего не найдено');
      }
      this.events.fire('requestsuccess', {
        result: result
      });
    },
    _onRequestFail: function (err) {
      this._error = err;
      this.events.fire('requestfail', {
        error: err
      });
    },
    getResult: function () {
      return this._result;
    },
    getError: function () {
      return this._error;
    },
    setGeocodeBounds: function (bounds) {
      this._options.boundedBy = bounds;
    }
  });

  provide(SearchModel);
});
