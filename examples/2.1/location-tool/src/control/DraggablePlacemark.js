ym.modules.define('control.DraggablePlacemark', [
    'util.defineClass',
    'util.extend',
    'util.Dragger',
    'collection.Item',
    'data.Manager',
    'layout.storage',
    'option.presetStorage'
], function (provide, defineClass, extend, Dragger, CollectionItem, DataManager, layoutStorage, presetStorage) {

    var ICON_SIZE = [34, 41];
    var ICON_OFFSET = { top: 48, left: 11 };
    var DraggablePlacemark = defineClass(function (options) {
        DraggablePlacemark.superclass.constructor.call(this, extend({ color: 'red' }, options));

        this.state = new DataManager();
    }, CollectionItem, {
        onAddToMap: function (map) {
            DraggablePlacemark.superclass.onAddToMap.call(this, map);

            this._element = this._createElement();
            this._cursor = null;
            this._dragger = new Dragger({
                autoStartElement: this._element
            });
            this._dragOffset = [0, 0];
            this.getParent().getChildElement(this).then(this._onChildElement, this);
        },
        onRemoveFromMap: function (oldMap) {
            this._clearListeners();
            this.layout.setParentElement(null);
            this._removeElement();

            DraggablePlacemark.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _createElement: function () {
            var elem = document.createElement('div'),
                size = this.getMap().container.getSize();

            elem.style.position = 'absolute';
            elem.style.width = ICON_SIZE[0] + 'px';
            elem.style.height = ICON_SIZE[1] + 'px';
            elem.style.left = ((size[0] / 2) - ICON_OFFSET.left) + 'px';
            elem.style.top = ((size[1] / 2) - ICON_OFFSET.top) + 'px';

            return elem;
        },
        _removeElement: function () {
            this._element.parentNode.removeChild(this._element);
        },
        _onChildElement: function (parentDomContainer) {
             parentDomContainer.appendChild(this._element);

            var preset = presetStorage.get('islands#icon');
            // var Layout = layoutStorage.get(preset.iconLayout.domLayout);
            var Layout = layoutStorage.get(preset.iconLayout.canvasLayout);
            // var Layout = layoutStorage.get('default#image');

            this.layout = new Layout({
                state: this.state,
                options: this.options
            });
            this.layout.setParentElement(this._element);
            // Зануляем смещение DOM-элемента метки
            this._element.firstChild.style.left = 0;
            this._element.firstChild.style.top = 0;
            this._setupListeners();
        },
        _setupListeners: function () {
            this.layout.events
                .add('mouseenter', this._onMouseEnter, this)
                .add('mouseleave', this._onMouseLeave, this);
            this.getMap().container.events
                .add('sizechange', this._onMapContainerSizeChange, this);
            this._dragger.events
                .add('start', this._onDragStart, this)
                .add('move', this._onDrag, this)
                .add('stop', this._onDragStop, this);
        },
        _clearListeners: function () {
            this._dragger.events
                .remove('start', this._onDragStart, this)
                .remove('move', this._onDrag, this)
                .remove('stop', this._onDragStop, this);
            this.getMap().container.events
                .remove('sizechange', this._onMapContainerSizeChange, this);
            this.layout.events
                .remove('mouseenter', this._onMouseEnter, this)
                .remove('mouseleave', this._onMouseLeave, this);
        },
        _onMouseEnter: function () {
            this._cursor = this.getMap().cursors.push('grab');
        },
        _onMouseLeave: function () {
            this._cursor.remove();
        },
        _onMapContainerSizeChange: function (e) {
            var newSize = e.get('newSize');
            var oldSize = e.get('oldSize');
            var offset = [
                (newSize[0] - oldSize[0]) / 2,
                (newSize[1] - oldSize[1]) / 2
            ];
            var position = this.getPosition();

            this.setPosition([position[0] + offset[0], position[1] + offset[1]]);
        },
        _onDragStart: function (e) {
            var ePos = e.get('position');
            var pPos = this.getPosition();
            this._dragOffset[0] = ePos[0] - pPos[0];
            this._dragOffset[1] = ePos[1] - pPos[1];
            this._cursor.setKey('grabbing');
        },
        _onDrag: function (e) {
            var position = e.get('position');

            this.setPosition(position);
        },
        _onDragStop: function (e) {
            if(this._cursor) {
                this._cursor.setKey('pointer');
            }
            this._dragOffset = [0, 0];
        },
        setPosition: function (position) {
            var map = this.getMap(),
                elem = this._element,
                offset = map.container.getOffset(),
                dragOffset = this._dragOffset,
                pos = [position[0] - dragOffset[0], position[1] - dragOffset[1]],
                coords = map.options.get('projection').fromGlobalPixels(
                    map.converter.pageToGlobal(pos),
                    map.getZoom()
                );

            this.state.set('markerCenter', coords);

            elem.style.left = (pos[0] - offset[0] - ICON_OFFSET.left) + 'px';
            elem.style.top = (pos[1] - offset[1] - ICON_OFFSET.top) + 'px';
        },
        getPosition: function () {
            var map = this.getMap(),
                elem = this._element,
                offset = map.container.getOffset();

            return [
                parseFloat(elem.style.left) + offset[0] + ICON_OFFSET.left,
                parseFloat(elem.style.top) + offset[1] + ICON_OFFSET.top
            ];
        }
    });

    provide(DraggablePlacemark);
});
