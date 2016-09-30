ym.modules.define('km.App', [
 'util.defineClass',
 'km.Map',
], function (provide, defineClass, Map) {
  var App = defineClass(function (el) {
    this._map = new Map(el);
    // this._setupListeners();
  }, {
    _setupListeners: function () {
      this._listeners = this._map.events.group();
    },
    _clearListeners: function () {
      this._listeners.removeAll()
    },
  });

  provide(App);
});
