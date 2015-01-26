ym.modules.define('control.DraggablePlacemark', [
    'util.defineClass',
    'util.extend',
    'util.Dragger',
    'collection.Item',
    'data.Manager',
    'layout.storage',
    'option.presetStorage'
], function (provide, defineClass, extend, Dragger, CollectionItem, DataManager, layoutStorage, presetStorage) {

    var ICON_HALF_HEIGHT = 41 / 2;
    var DraggablePlacemark = defineClass(function (options) {
        DraggablePlacemark.superclass.constructor.call(this, extend({ preset: 'islands#redIcon' }, options));

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
            oldMap.panes.get('events').getElement().removeChild(this._element);

            DraggablePlacemark.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _createElement: function () {
            var elem = document.createElement('div'),
                size = this.getMap().container.getSize();

            elem.style.position = 'absolute';
            elem.style.left = (size[0] / 2) + 'px';
            elem.style.top = (size[1]- ICON_HALF_HEIGHT) / 2 + 'px';

            return elem;
        },
        _onChildElement: function (parentDomContainer) {
            this._draggerEvents = this.dragger.events.group();
            // parentDomContainer.appendChild(this._element);
            this.getMap().panes.get('events').getElement().appendChild(this._element);

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
        _onDragStart: function (e) {
            this._isDragged = true;
            this._onDrag(e);
        },
        _onDrag: function (e) {
            var position = e.get('position');

            this.setPosition(position);
        },
        _onDragStop: function (e) {
        // element.parentElement.removeChild(element);
        },
        setPosition: function (position) {
            var map = this.getMap(),
                elem = this._element,
                offset = map.container.getOffset();
                coords = map.options.get('projection').fromGlobalPixels(
                    map.converter.pageToGlobal(position),
                    map.getZoom()
                );

            this.state.set('markerCenter', coords);

            elem.style.left = (position[0] - offset[0]) + 'px';
            elem.style.top = (position[1] - offset[1]) + 'px';
        },
        getPosition: function () {
            var map = this.getMap(),
                elem = this._element,
                offset = map.container.getOffset();

            return [
                parseFloat(elem.style.left) + offset[0],
                parseFloat(elem.style.top) + offset[1] + ICON_HALF_HEIGHT / 2
            ];
        }
    });

    provide(DraggablePlacemark);
});
