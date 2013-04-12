function CrossControl() {
    this.events = new ymaps.event.Manager();
    this.options = new ymaps.option.Manager();
    this.state = new ymaps.data.Manager();
}

ymaps.ready(function () {
    CrossControl.Layout = ymaps.templateLayoutFactory.createClass(
        '<div class="cross-control" style="right:$[options.position.right]px; top:$[options.position.top]px;"></div>'
    );
});

CrossControl.prototype = {
    constructor: CrossControl,
    setParent: function (parent) {
        this.parent = parent;

        if(parent) {
            var map = parent.getMap();

            this._setPosition(map.container.getSize());
            map.container.events.add('sizechange', this._setPosition, this);
            // передаем в макет контрола данные о его опциях.
            this.layout = new this.constructor.Layout({ options: this.options });
            // контрол будет добавляться в pane событий.
            this.layout.setParentElement(map.panes.get('events').getElement());
        }
        else {
            this.layout.setParentElement(null);
        }
    },
    _setPosition: function (size) {
        // -8, так как картинка 16х16
        this.options.set('position', {
            top: size[1] / 2 - 8,
            right: size[0] / 2 - 8
        });
    },
    getParent: function () {
        return this.parent;
    }
};
