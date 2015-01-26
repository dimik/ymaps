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
            this._clearListeners();

            DraggablePlacemark.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _createElement: function () {
            return document.createElement('div');
        },
        _onChildElement: function (parentDomContainer) {
            this._draggerEvents = this.dragger.events.group();
            parentDomContainer.appendChild(this._element);

            var Layout = layoutStorage.get('default#image');

            this.layout = new Layout({
                state: this.state,
                options: this.options
            });
            this.layout.setParentElement(this._element);
            this._setupListeners();
        },
        _setupListeners: function () {
            this._draggerEvents
                .add('start', this._onDrag, this)
                .add('move', this._onDrag, this)
                .add('stop', this._onDragStop, this);
        },
        _clearListeners: function () {
            this._draggerEvents.removeAll();
        },
        _onDrag: function (e) {
            var position = e.get('position');
            this._setPosition(position);
        },
        _onDragStop: function (e) {
        // element.parentElement.removeChild(element);
        console.log('stop');
        },
        _setPosition: function (position) {
            this._element.style.position = 'absolute';
            this._element.style.left = position[0] + 'px';
            this._element.style.top = position[1] + 'px';
        },
    });

    provide(DraggablePlacemark);
});
