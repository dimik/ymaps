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
            { float: 'none', position: { bottom: 10, right: 5 } }
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
        this._control.data.set('data.content', content);
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
    config.layout || ''
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

        if(parent) {
            var map = parent.getMap();

            /**
             * Передаем в макет контрола данные и опции.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#constructor-summary
             */
            this.layout = new this.constructor.Layout({
                options: this.options,
                data: this.data
            });
            /**
             * Контрол будет добавляться в pane событий, чтобы исключить интерактивность.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#setParentElement
             */
            // this.layout.setParentElement(map.panes.get('events').getElement());
            this.layout.setParentElement(parent.getChildElement(this));
        }
        else {
            this.layout.setParentElement(null);
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
