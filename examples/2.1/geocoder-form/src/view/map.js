ym.modules.define('map-view', [
  'util.defineClass',
  'util.extend',
  'Map',
  'Placemark',
  'event.Manager'
], function (provide, defineClass, extend, Map, Placemark, EventManager) {
  var config = {
    id: 'map',
    state: {
      center: [55.751574, 37.573856],
      zoom: 9,
      controls: ['zoomControl', 'geolocationControl', 'typeSelector']
    },
    options: {}
  };
  var MapView = defineClass(function () {
    var map = this._map = new Map(config.id, config.state, config.options);
    this.events = new EventManager({ context: map, parent: map.events });
  }, {
    render: function (result) {
      this._map.geoObjects
        .add(this._point = result);

      this.setFocusOnPoint();

      return this;
    },
    clear: function () {
      if(this._point) {
        this._map.geoObjects
          .remove(this._point);
        this._point = null;
      }

      return this;
    },
    getPoint: function () {
      return this._point;
    },
    setFocusOnPoint: function () {
      var point = this._point;

      this._map.setBounds(point.properties.get('boundedBy'), {
        checkZoomRange: true,
        duration: 200
      })
      .then(function () {
        point.balloon.open();
      });
    }
  });

  provide(MapView);
});
