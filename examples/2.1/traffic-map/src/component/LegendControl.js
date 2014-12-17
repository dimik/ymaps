ym.modules.define('TrafficResearch.component.LegendControl', [
    'util.defineClass',
    'collection.Item',
    'data.Manager',
    'option.Manager',
    'event.Manager',
    'templateLayoutFactory',
    'vow'
], function (provide, defineClass, CollectionItem, DataManager, OptionManager, EventManager, templateLayoutFactory, vow) {
    var LegendControlLayout = templateLayoutFactory.createClass('{{ data.content|raw }}');
    var LegendControl = defineClass(function (params) {
        params = params || {};
        this.events = new EventManager();
        this.options = new OptionManager(params.options || {});
        this.data = new DataManager(params.data || {});
    }, {
        /**
         * Устанавливает родительский объект.
         * @function
         * @name LegendControl.setParent
         * @param {IControlParent} parent Родительский объект.
         * @returns {LegendControl} Возвращает ссылку на себя.
         */
        setParent: function (parent) {
            this.parent = parent;

            /**
             * Передаем в макет контрола данные и опции.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#constructor-summary
             */
            var layout = new LegendControlLayout({
                    options: this.options,
                    data: this.data
                });

            if(parent) {
                parent.getChildElement(this)
                    .then(layout.setParentElement, layout);
            }
            else {
                layout.setParentElement(null);
            }

            return this;
        },
        /**
         * Возвращает ссылку на родительский объект.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IControl.xml#getParent
         * @function
         * @name LegendControl.getParent
         * @returns {IControlParent} Ссылка на родительский объект.
         */
        getParent: function () {
            return this.parent;
        }
    });

    provide(LegendControl);
});
