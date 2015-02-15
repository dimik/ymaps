ym.modules.define('control.MapStateInfoWindow', [
    'util.defineClass',
    'collection.Item',
    'data.Manager',
    'Monitor',
    'layout.MapStateInfoWindowLayout'
], function (provide, defineClass, CollectionItem, DataManager, Monitor, layoutStorage) {
    var MapStateInfoWindow = defineClass(function (options) {
        MapStateInfoWindow.superclass.constructor.call(this, options);

        this.data = new DataManager();
        this.state = new DataManager();
        this._stateMonitor = new Monitor(this.state);
    }, CollectionItem, {
        onAddToMap: function (map) {
            MapStateInfoWindow.superclass.onAddToMap.call(this, map);

            this.state.set({
                mapCenter: map.getCenter(),
                mapZoom: map.getZoom(),
                mapBounds: map.getBounds()
            });
            this._setupStateMonitor();
            this.getParent().getChildElement(this).then(this._onChildElement, this);
        },
        onRemoveFromMap: function (oldMap) {
            this._clearStateMonitor();

            MapStateInfoWindow.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _setupStateMonitor: function () {
            this._stateMonitor
                .add('mapCenter', this._onMapCenterChange, this)
                .add('mapZoom', this._onMapZoomChange, this)
                .add('mapBounds', this._onMapBoundsChange, this)
        },
        _clearStateMonitor: function () {
            this._stateMonitor.removeAll();
        },
        _onMapCenterChange: function (newCenter) {
            this.getMap().setCenter(newCenter);
        },
        _onMapZoomChange: function (newZoom) {
            this.getMap().setZoom(newZoom, {
                checkZoomRange: true
            });
        },
        _onMapBoundsChange: function (newBounds) {
            this.getMap().setBounds(newBounds, {
                checkZoomRange: true
            });
        },
        _onChildElement: function (parentDomContainer) {
            var Layout = layoutStorage.get('mapstate#window');

            this.layout = new Layout({ control: this, data: this.data, options: this.options });
            /**
             * Контрол будет добавляться в pane событий, чтобы исключить интерактивность.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#setParentElement
             */
            this.layout.setParentElement(parentDomContainer);
        }
    });

    provide(MapStateInfoWindow);
});
