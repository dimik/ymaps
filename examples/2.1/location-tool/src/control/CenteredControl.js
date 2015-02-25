ym.modules.define('CenteredControl', [
    'util.defineClass',
    'util.extend',
    'templateLayoutFactory',
    'collection.Item',
    'data.Manager'
], function (provide, defineClass, extend, templateLayoutFactory, CollectionItem, DataManager) {

    var CenteredControlLayout = templateLayoutFactory.createClass([
            '<div class="container-fluid" style="position:absolute; left:{{ options.pos.left }}px; top:{{ options.pos.top }}px;">',
                '{% if options.contentLayout %}',
                    '{% include options.contentLayout %}',
                '{% endif %}',
            '</div>'
        ].join(''));

    var CenteredControl = defineClass(function (parameters) {
            CenteredControl.superclass.constructor.call(this, extend({
                float: 'none'
            }, parameters.options));
            this.data = new DataManager(parameters.data);
        }, CollectionItem, {
            onAddToMap: function (map) {
                CenteredControl.superclass.onAddToMap.call(this, map);

                this.getParent().getChildElement(this).then(this._onChildElement, this);
            },
            onRemoveFromMap: function (map) {
                this._clearListeners(map);
                this._layout.setParentElement(null);

                CenteredControl.superclass.onRemoveFromMap.call(this, map);
            },
            _onChildElement: function (element) {
                var layout = this._layout = new CenteredControlLayout({
                    options: this.options,
                    data: this.data,
                    control: this
                });
                layout.setParentElement(element);
                this._setupListeners();
                this._setPosition();
            },
            _setupListeners: function () {
                this.getMap().events
                    .add('sizechange', this._setPosition, this);
            },
            _clearListeners: function (map) {
                map.events
                    .remove('sizechange', this._setPosition, this);
            },
            _setPosition: function () {
                var mapSize = this.getMap().container.getSize(),
                    layoutContentElement = this._layout.getParentElement().firstChild.firstChild;

                this.options.set('pos', {
                    top: Math.round(mapSize[1] / 2 - layoutContentElement.offsetHeight / 2),
                    left: Math.round(mapSize[0] / 2 - layoutContentElement.offsetWidth / 2)
                });
            }
        });

    provide(CenteredControl);
});
