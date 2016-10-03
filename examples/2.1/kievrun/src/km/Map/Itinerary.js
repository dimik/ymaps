ym.modules.define('km.Map.Itinerary', [
 'util.defineClass',
 'GeoObjectCollection',
 'Placemark',
 'Polyline',
 'km.Data.Itinerary',
 'km.Data.Itinerary.start',
 'km.Data.Itinerary.finish',
 'km.Map.Points'
], function (provide, defineClass, GeoObjectCollection, Placemark, Polyline, ItineraryData, StartPoint, FinishPoint, Points) {
  var Itinerary = defineClass(function (parent) {
    this._geoObjects = new GeoObjectCollection();
    parent.add(this._geoObjects);
  }, {
    render: function (data) {
      this._geoObjects
        .add(this._createItinerary());

    this._points = new Points(this._geoObjects);
    this._points.render();

      this._geoObjects
        .add(this._createStartPoint())
    // .add(this._createFinishPoint());

      this._setupListeners();
    },
    clear: function () {
      this._clearListeners();
      this._points.render();
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
      e.get('target').options.set('strokeColor', '#1e98ff');
    },
    _handleMouseLeave: function (e) {
      e.get('target').options.set('strokeColor', '#9e7afb');
    },
    _createItinerary: function () {
      return this._itinerary = new Polyline(ItineraryData, {}, {
        // strokeColor: '#1e98ff',
        strokeColor: '#9e7afb',
        strokeWidth: 4
      });
    },
    _createStartPoint: function () {
      return new Placemark(StartPoint, {}, {
        iconLayout: 'default#image',
        /*
        iconImageHref: 'http://kyivmarathon.org/wp-content/themes/WizzairMarathon-2016/maps/img/start_pin.png',
        iconImageSize: [51, 20],
        iconImageOffset: [-48, -12]
        */
        iconImageHref: 'images/7.png',
        iconImageSize: [32, 32],
        iconImageOffset: [-32, -16]
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
