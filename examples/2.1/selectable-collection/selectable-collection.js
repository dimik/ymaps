ym.modules.define('SelectableCollection', [
  'util.defineClass',
  'util.id',
  'util.extend',
  'GeoObjectCollection',
  'geometry.Rectangle',
], function (provide, defineClass, id, extend, GeoObjectCollection, Rectangle) {

  var SelectableCollection = defineClass(function(features, options) {
      SelectableCollection.superclass.constructor.call(this, extend({
        geometry: new Rectangle([[0, 0], [0, 0]])
      }, features), extend({}, SelectableCollection.defaultOptions, options));

      this.selected = {};
      this.state.events.add('change', this.onCollectionStateChange, this);
      this.events.add('mapchange', this.onMapChange, this);
  }, ymaps.GeoObjectCollection, /** @lends ymaps.GeoObjectCollection.prototype */{
      onCollectionStateChange: function (e) {
          var selecting = this.state.get('selecting');

          if(selecting == null) {
              return;
          }

          if(selecting) {
              this.setupListeners();
          }
          else {
              this.clearListeners();
          }
      },
      onMapChange: function (e) {
          this.map = e.get('newMap');
          this.map.geoObjects.add(this.selected);
      },
      setupListeners: function () {
          this.map.events
              .add('mousedown', this.onMapMouseDown, this)
              .add('mousemove', this.onMapMouseMove, this);
          // this.map.geoObjects.events.add('mousemove', this.onMapMouseMove, this); // Слушаем "mousemove" и на геообъектах карты.
          if(this.state.get('drawing')) {
              this.selected.events.add('mousedown', function (e) {
                  e.stopPropagation();
              });
          }
      },
      clearListeners: function () {
          this.map.geoObjects.events.remove('mousemove', this.onMapMouseMove, this);
          this.map.events
              .remove('mousemove', this.onMapMouseMove, this)
              .remove('mousedown', this.onMapMouseDown, this);
      },
      onMapMouseUp: function (e) {
          // Отписываемся от всех mouseup-ов.
          this.map.geoObjects.events.remove('mouseup', this.onMapMouseUp, this);
          this.map.events.remove('mouseup', this.onMapMouseUp, this);
      },
      onMapMouseDown: function (e) {
          var coords = e.get('coords');

          // console.log(e.get('target'));

          this.geometry.setCoordinates([coords, coords]);
          // this.options.set('preset', 'selectable#bounds');

          this.map.events.add('mouseup', this.onMapMouseUp, this);
          this.map.geoObjects.events.add('mouseup', this.onMapMouseUp, this);
          this.each(this.updateSelected, this);
      },
      onMapMouseMove: function (e) {
          var oldCoords = this.geometry.getCoordinates(),
              newCoords = [oldCoords[0], e.get('coords')];

          this.geometry.setCoordinates(newCoords);
          this.each(this.updateSelected, this);
      },
      isSelected: function (geoObject) {
        return !!this.selected[id(geoObject)];
      },
      updateSelected: function (geoObject) {
          var coords = geoObject.geometry.getCoordinates();

          this.selected[id(geoObject)] = this.geometry.contains(coords);
      }
  });
  SelectableCollection.defaultOptions = {
      preset: 'islands#redIcon',
      pointOverlay: 'interactive#placemark',
      draggable: true,

      fill: false,
      strokeColor: '#F00',
      interactivityModel: 'default#transparent' // Пробрасываем события на карту, иначе прямоугольник перехватит "mouseup"
  };

  provide(SelectableCollection);

});
