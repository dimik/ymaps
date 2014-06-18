ymaps.modules.define('ymaps-control-base', [
    'inherit',
    'data.Manager',
    'option.Manager',
    'event.Manager',
    'templateLayoutFactory'
], function (provide, inherit, DataManager, OptionManager, EventManager, templateLayoutFactory) {

/**
 * @class
 * @name BaseControl
 */
var BaseControl = inherit({
    __constructor: function (parameters) {
        parameters = parameters || {};
        parameters.data = parameters.data || {};
        parameters.state = parameters.state || {};
        parameters.options = parameters.options || {};

        this.data = new DataManager(parameters.data);
        this.state = new DataManager(parameters.state);
        this.options = new OptionManager(parameters.options);
        this.events = new EventManager();

        /**
         * Передаем в макет контрола данные о его опциях.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#constructor-summary
         */
        this._layout = this._createLayout({ control: this, data: this.data, state: this.state, options: this.options });
        this._map = null;
        this._element = null;
    },
    /**
     * Устанавливает родительский объект.
     * @function
     * @name BaseControl.setParent
     * @param {IControlParent} parent Родительский объект.
     * @returns {BaseControl} Возвращает ссылку на себя.
     */
    setParent: function (parent) {
        this._destroy();
        this._parent = parent;

        if(parent) {
            parent.getChildElement(this)
                .done(this._init, this);
        }
        else {
            this._layout.setParentElement(null);
        }

        return this;
    },
    /**
     * Возвращает ссылку на родительский объект.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IControl.xml#getParent
     * @function
     * @name BaseControl.getParent
     * @returns {IControlParent} Ссылка на родительский объект.
     */
    getParent: function () {
        return this._parent;
    },

    /**
     * Возвращает ссылку на карту.
     * @function
     * @name BaseControl.getMap
     * @returns {Map} Ссылка на карту.
     */
    getMap: function () {
        return this._map;
    },

    _init: function (el) {
        this._map = this._parent.getMap();
        this._layout.setParentElement(
            this._element = el
        );
    },
    _destroy: function () {
        this._map = this._element = null;
    },
    _createLayout: function (data) {
        var ControlLayout = templateLayoutFactory.createClass([
                '<ymaps{% if options.visible == false %} style="display:none;"{% endif %}>',
                    '{% include options.contentLayout %}',
                '</ymaps>'
            ].join(''));

        return new ControlLayout(data);
    }
});

provide(BaseControl);

});
