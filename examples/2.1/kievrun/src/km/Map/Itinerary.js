ym.modules.define('km.Map.Itinerary', [
 'util.defineClass',
 'GeoObjectCollection',
 'Placemark',
 'Polyline',
 'km.Data.Itinerary',
 'km.Data.Itinerary.start',
 'km.Data.Itinerary.finish'
], function (provide, defineClass, GeoObjectCollection, Placemark, Polyline, ItineraryData, StartPoint, FinishPoint) {
  var Itinerary = defineClass(function (parent) {
    this._geoObjects = new GeoObjectCollection();
    parent.add(this._geoObjects);
  }, {
    render: function (data) {
      this._geoObjects
        .add(this._createItinerary())
        .add(this._createStartPoint())
        .add(this._createFinishPoint());

      this._setupListeners();
    },
    clear: function () {
      this._clearListeners();
      this._geoObjects.removeAll();
    },
    _setupListeners: function () {
      this._listeners = this._itinerary.events.group()
        .add('mouseenter', this._handleMouseEnter, this)
        .add('mouseleave', this._handleMouseLeave, this);
    },
    _clearListeners: function () {
      this._listeners.removeAll();
    },
    _handleMouseEnter: function (e) {
      e.get('target').options.set('strokeColor', '#00ff00');
    },
    _handleMouseLeave: function (e) {
      e.get('target').options.set('strokeColor', '#ff0000');
    },
    _createItinerary: function () {
      return this._itinerary = new Polyline(ItineraryData, {}, {
        strokeColor: '#ff0000',
        strokeWidth: 4
      });
    },
    _createStartPoint: function () {
      return new Placemark(StartPoint, {}, {
        iconLayout: 'default#image',
        iconImageHref: 'http://kyivmarathon.org/wp-content/themes/WizzairMarathon-2016/maps/img/start_pin.png',
        iconImageSize: [51, 20],
        iconImageOffset: [-48, -12]
      });
    },
    _createFinishPoint: function () {
      return new Placemark(FinishPoint, {}, {
        iconLayout: 'default#image',
        iconImageHref: 'http://kyivmarathon.org/wp-content/themes/WizzairMarathon-2016/maps/img/finish_pin.png',
        iconImageSize: [51, 20],
        iconImageOffset: [5, -12]
      });
    }
  });

  provide(Itinerary);
});
