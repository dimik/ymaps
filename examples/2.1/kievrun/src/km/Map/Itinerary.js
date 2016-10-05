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

  var ACTIVE_ROUTE_COLOR = '#1e98ff';
  var ROUTE_COLOR = '#9e7afb';

  var Itinerary = defineClass(function (parent) {
    this._geoObjects = new GeoObjectCollection();
    parent.add(this._geoObjects);
  }, {
    render: function (data) {
      this._geoObjects
        .add(this._createItinerary());

    this._points = new Points(this._geoObjects);
    this._pointsGeoQuery = this._points.render();
    this._pointsGeoQuery.setOptions({
      iconColor: ROUTE_COLOR
    });

    this._geoObjects
      .add(this._createStartPoint());
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
      this._pointsGeoQuery
        .addEvents('mouseenter', this._handleMouseEnter, this)
        .addEvents('mouseleave', this._handleMouseLeave, this);
    },
    _clearListeners: function () {
      this._listeners.removeAll();
      this._pointsGeoQuery
        .removeEvents('mouseenter', this._handleMouseEnter, this)
        .removeEvents('mouseleave', this._handleMouseLeave, this);
    },
    _handleMouseEnter: function (e) {
        this._itinerary
          .options.set('strokeColor', ACTIVE_ROUTE_COLOR);
        this._pointsGeoQuery.setOptions({
          iconColor: ACTIVE_ROUTE_COLOR
        });
    },
    _handleMouseLeave: function (e) {
      this._itinerary
        .options.set('strokeColor', ROUTE_COLOR);
      this._pointsGeoQuery.setOptions({
        iconColor: ROUTE_COLOR
      });
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
