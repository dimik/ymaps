ym.modules.define('km.Map.Points', [
 'util.defineClass',
 'GeoObjectCollection',
 'geoQuery',
 'Placemark',
 'km.Data.Points'
], function (provide, defineClass, GeoObjectCollection, geoQuery, Placemark, PointData) {
  var Points = defineClass(function (parent) {
    this._geoObjects = new GeoObjectCollection();
    parent.add(this._geoObjects);
  }, {
    render: function (data) {
      geoQuery(PointData.map(this._createPlacemark, this))
        .addTo(this._geoObjects);
    },
    clear: function () {
      this._geoObjects.removeAll();
    },
    _createPlacemark: function (coords, index) {
      return new Placemark(coords, {
        iconContent: '<h6 class="km-sign">' + (index + 1) + '</h6>'
      }, {
        preset: 'islands#blueCircleIcon'
        /*
        iconLayout: 'default#image',
        iconImageHref: 'http://kyivmarathon.org/wp-content/themes/WizzairMarathon-2016/maps/img/km' + (index + 1) + '.png',
        iconImageSize: [30, 30],
        iconImageOffset: [-15, -30]
        */
      });
    },
  });

  provide(Points);
});
