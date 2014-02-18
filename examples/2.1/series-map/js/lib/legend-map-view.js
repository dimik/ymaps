define(['ready!ymaps', 'module'], function (ymaps, module) {

var config = module.config();

function LegendMapView(map) {
    this._map = map;
    this._control = null;
}

LegendMapView.prototype = {
    constructor: LegendMapView,
    render: function (data) {
        this._map.controls.add(
            this._control = new LegendControl({ data: { content: data }}),
            { float: 'none', position: config.position }
        );

        return this;
    },
    clear: function () {
        this._map.controls.remove(
            this._control
        );

        this._control = null;

        return this;
    },
    show: function () {
        this._control.options.set('visible', true);

        return this;
    },
    hide: function () {
        this._control.options.set('visible', false);

        return this;
    },
    setContent: function (content) {
        this._control.data.set('content', content);

        return this;
    }
};

/**
 * Класс контрола "Легенда".
 * @class
 * @name LegendControl
 */
function LegendControl(params, options) {
    this.events = new ymaps.event.Manager();
    this.options = new ymaps.option.Manager();
    this.data = new ymaps.data.Manager(params && params.data || {});
}

/**
 * Макет контрола.
 * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/templateLayoutFactory.xml
 * @class
 * @name LegendControl.Layout
 */
LegendControl.Layout = ymaps.templateLayoutFactory.createClass(
    config.template || ''
);

/**
 * @lends LegendControl.prototype
 */
LegendControl.prototype = {
    /**
     * @constructor
     */
    constructor: LegendControl,
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
        var layout = new this.constructor.Layout({
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
};

return LegendMapView;

});
