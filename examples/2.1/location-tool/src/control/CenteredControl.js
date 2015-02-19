ym.modules.define('CenteredControl', [
    'util.defineClass',
    'util.extend',
    'templateLayoutFactory',
    'collection.Item',
], function (provide, defineClass, extend, templateLayoutFactory, CollectionItem) {

    var ContentLayout = templateLayoutFactory.createClass([
            '<div class="container-fluid">',
                '{% if options.contentBodyLayout %}',
                    '{% include options.contentBodyLayout %}',
                '{% endif %}',
            '</div>'
        ].join(''), {
            build: function () {
                ContentLayout.superclass.build.call(this);
                this._setupListeners();
                this._setPosition();
            },

            clear: function () {
                this._clearListeners();
                ContentLayout.superclass.clear.call(this);
            },

            _setupListeners: function () {
                this.getMap().events
                    .add('sizechange', this._setPosition, this);
            },

            _clearListeners: function () {
                this.getMap().events
                    .remove('sizechange', this._setPosition, this);
            },

            _setPosition: function () {
                var control = this.getData().control,
                    mapSize = this.getMap().container.getSize(),
                    layoutContentElement = this.getElement().firstChild;

                control.options.set('position', {
                    top: Math.round(mapSize[1] / 2 - layoutContentElement.offsetHeight / 2),
                    left: Math.round(mapSize[0] / 2 - layoutContentElement.offsetWidth / 2)
                });
            }
        });

    var CenteredControl = defineClass(function (params) {
            CenteredControl.superclass.constructor.call(this, extend({
                contentLayout: ContentLayout,
                float: 'none'
            }, options));
        }, CollectionItem);

    provide(CenteredControl);
});
