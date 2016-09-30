ym.modules.define('km.Map', [
 'util.defineClass',
 'event.Manager',
 'Map',
 'km.Map.LegendControl',
 'km.Map.Itinerary',
 'km.Map.Points',
 'km.Map.Poi',
], function (provide, defineClass, EventManager, Map, LegendControl, Itinerary, Points, Poi) {
  provide(defineClass(function (el) {
    var map = this._map = this._createMap(el);
    this.events = new EventManager();
    this._legend = new LegendControl({
      float: 'none',
      position: {
        right: 40,
        top: 40
      }
    });
    map.controls.add(this._legend);
    this._setupListeners();

    this._itinerary = new Itinerary(map.geoObjects);
    this._itinerary.render();
    this._points = new Points(map.geoObjects);
    this._points.render();
    this._poi = new Poi(map.geoObjects);
    this._poi.render();
  }, {
    _createMap: function (el) {
      return new Map(el, {
        center: [50.43837750477888,30.53715151203909],
        zoom: 13,
        controls: []
      }, {
      });
    },
    _setupListeners: function () {
      this._listeners = this._legend.events.group()
        .add('activegroupchange', this._handleActiveGroupChange, this);
    },
    _clearListeners: function () {
      this._listeners.removeAll()
    },
    _handleActiveGroupChange: function (e) {
      this._poi.setActiveGroup(e.get('groupId'));
    }
  }));
});
