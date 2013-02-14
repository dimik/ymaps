function SelectableCollection() {
    SelectableCollection.superclass.constructor.apply(this, arguments);

    this._selectedArea = null;
    this._selected = new ymaps.GeoObjectCollection(null, SelectableCollection.markerOptions);
    this.state.events.add('change', this._onCollectionStateChange, this);
    this.events.add('mapchange', this._onMapChange, this);
}

SelectableCollection.markerOptions = {
    preset: 'twirl#redIcon'
};
SelectableCollection.rectangleOptions = {
    fill: false,
    strokeColor: '#F00',
    interactivityModel: 'default#transparent' // Пробрасываем события на карту, иначе прямоугольник перехватит "mouseup"
};

ymaps.ready(function () {
    ymaps.util.augment(SelectableCollection, ymaps.GeoObjectCollection, {
        _onCollectionStateChange: function (e) {
            var selecting = this.state.get('selecting');

            if(selecting == null) {
                return;
            }

            if(selecting) {
                this._attachHandlers();
            }
            else {
                this._detachHandlers();
            }
        },
        _onMapChange: function (e) {
            this._map = e.get('newMap');
            this._map.geoObjects.add(this._selected);
        },
        _attachHandlers: function () {
            this._map.events
                .add('mousedown', this._onMapMouseDown, this)
                .add('mousemove', this._onMapMouseMove, this);
            this._map.geoObjects.events.add('mousemove', this._onMapMouseMove, this); // Слушаем "mousemove" и на геообъектах карты.
        },
        _detachHandlers: function () {
            this._map.geoObjects.events.remove('mousemove', this._onMapMouseMove, this);
            this._map.events
                .remove('mousemove', this._onMapMouseMove, this)
                .remove('mousedown', this._onMapMouseDown, this);
        },
        _onMapMouseDown: function (e) {
            var coords = e.get('coordPosition');

            this._selectedArea = new ymaps.Rectangle([coords, coords], null, SelectableCollection.rectangleOptions);
            this._map.geoObjects.add(this._selectedArea);

            this._map.events.add('mouseup', this._onMapMouseUp, this);
            this._map.geoObjects.events.add('mouseup', this._onMapMouseUp, this);
            this._selected.each(this._isSelected, this);
        },
        _onMapMouseMove: function (e) {
            if(!this._selectedArea) {
                return;
            }

            var oldCoords = this._selectedArea.geometry.getCoordinates(),
                newCoords = [oldCoords[0], e.get('coordPosition')];

            this._selectedArea.geometry.setCoordinates(newCoords);
            this.each(this._isSelected, this);
            this._selected.each(this._isSelected, this);
        },
        _isSelected: function (geoObject) {
            var coords = geoObject.geometry.getCoordinates();

            if(this._selectedArea && this._selectedArea.geometry.contains(coords)) {
                this._selected.add(geoObject);
            }
            else {
                this.add(geoObject);
            }
        },
        _onMapMouseUp: function (e) {
            if(this._selectedArea) {
                this._map.geoObjects.remove(this._selectedArea);
                this._selectedArea = null;
            }
            // Отписываемся от всех mouseup-ов.
            this._map.geoObjects.events.remove('mouseup', this._onMapMouseUp, this);
            this._map.events.remove('mouseup', this._onMapMouseUp, this);
        }
    });
});
