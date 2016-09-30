ym.modules.define('km.Map.Poi', [
 'util.defineClass',
 'GeoObjectCollection',
 'Placemark',
 'km.Data.Poi'
], function (provide, defineClass, GeoObjectCollection, Placemark, PoiData) {
  var Poi = defineClass(function (parent) {
    this._geoObjects = new GeoObjectCollection();
    this._activeGroup = null;
    this._groups = {};
    parent.add(this._geoObjects);
  }, {
    render: function () {
      PoiData.map(this._createGroup, this)
        .forEach(function (geoObjects) {
          this._geoObjects.add(geoObjects);
        }, this);
    },
    clear: function () {
      this._geoObjects.removeAll();
    },
    setActiveGroup: function (id) {
      if(this._activeGroup) {
        this._activeGroup.options.set('visible', false);
      }

      if(this._groups[id]) {
        this._activeGroup = this._groups[id];
        this._groups[id].options.set('visible', true);
      }
    },
    _createGroup: function (data) {
      return this._groups[data.id] = new GeoObjectCollection({
        properties: {
          name: data.name,
          id: data.id,
        },
        children: data.items.map(this._createPlacemark, this)
      }, {
        preset: data.preset,
        visible: false
      });
    },
    _createPlacemark: function (data, index) {
      return new Placemark(data.center, {}, {
        /*
        iconLayout: 'default#image',
        iconImageHref: data.icon,
        iconImageSize: [30, 30],
        iconImageOffset: [-15, -30]
        */
      });
    },
  });

  provide(Poi);
});
