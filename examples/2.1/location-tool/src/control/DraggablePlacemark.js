ym.modules.define('control.DraggablePlacemark', [
    'util.defineClass',
    'util.Dragger',
    'collection.Item',
    'data.Manager',
    'layout.storage'
], function (provide, defineClass, Dragger, CollectionItem, DataManager, layoutStorage) {

    var DraggablePlacemark = defineClass(function (options) {
        DraggablePlacemark.superclass.constructor.call(this, options);

        this.state = new DataManager();
    }, CollectionItem, {
        onAddToMap: function (map) {
            DraggablePlacemark.superclass.onAddToMap.call(this, map);

            this._element = this._createElement();
            this.dragger = new Dragger({
                autoStartElement: this._element
            });
            this.getParent().getChildElement(this).then(this._onChildElement, this);
        },
        onRemoveFromMap: function (oldMap) {
            DraggablePlacemark.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _createElement: function () {
            return document.createElement('div');
        },
        _onChildElement: function (parentDomContainer) {
            this._draggerEvents = this.dragger.events.group();
            parentDomContainer.appendChild(this._element);

            var Layout = layoutStorage.get('default#image');

            this.layout = new Layout({ state: this.state });
            /**
             * Контрол будет добавляться в pane событий, чтобы исключить интерактивность.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#setParentElement
             */
            this.layout.setParentElement(this._element);
        }
    });

    provide(DraggablePlacemark);
});
