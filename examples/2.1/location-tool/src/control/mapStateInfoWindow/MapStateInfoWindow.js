ym.modules.define('control.MapStateInfoWindow', [
    'util.defineClass',
    'collection.Item',
    'data.Manager',
    'layout.MapStateInfoWindowLayout'
], function (provide, defineClass, CollectionItem, DataManager, layoutStorage) {
    var MapStateInfoWindow = defineClass(function (options) {
        MapStateInfoWindow.superclass.constructor.call(this, options);

        this.data = new DataManager();
    }, CollectionItem, {
        onAddToMap: function (map) {
            MapStateInfoWindow.superclass.onAddToMap.call(this, map);

            this.getParent().getChildElement(this).then(this._onChildElement, this);
        },
        onRemoveFromMap: function (oldMap) {
            MapStateInfoWindow.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _onChildElement: function (parentDomContainer) {
            var Layout = layoutStorage.get('mapstate#window');

            this.layout = new Layout({ data: this.data, options: this.options });
            /**
             * Контрол будет добавляться в pane событий, чтобы исключить интерактивность.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#setParentElement
             */
            this.layout.setParentElement(parentDomContainer);
        }
    });

    provide(MapStateInfoWindow);
});
