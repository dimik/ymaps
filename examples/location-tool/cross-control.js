/**
 * Класс контрола "центр карты".
 * @class
 * @name CrossControl
 */
function CrossControl(options) {
    this.events = new ymaps.event.Manager();
    this.options = new ymaps.option.Manager();
}

ymaps.ready(function () {
    /**
     * Макет контрола.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/templateLayoutFactory.xml
     * @class
     * @name CrossControl.Layout
     */
    CrossControl.Layout = ymaps.templateLayoutFactory.createClass(
        '<div class="cross-control" style="right:$[options.position.right]px; top:$[options.position.top]px;"></div>'
    );
});

/**
 * @lends CrossControl.prototype
 */
CrossControl.prototype = {
    /**
     * @constructor
     */
    constructor: CrossControl,
    /**
     * Устанавливает родительский объект.
     * @function
     * @name CrossControl.setParent
     * @param {IControlParent} parent Родительский объект.
     * @returns {CrossControl} Возвращает ссылку на себя.
     */
    setParent: function (parent) {
        this.parent = parent;

        if(parent) {
            var map = this._map = parent.getMap();
            this._setPosition(map.container.getSize());
            this._setupListeners();
            /**
             * Передаем в макет контрола данные о его опциях.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#constructor-summary
             */
            this.layout = new this.constructor.Layout({ options: this.options });
            /**
             * Контрол будет добавляться в pane событий, чтобы исключить интерактивность.
             * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/ILayout.xml#setParentElement
             */
            this.layout.setParentElement(map.panes.get('events').getElement());
        }
        else {
            this.layout.setParentElement(null);
            this._clearListeners();
        }

        return this;
    },
    /**
     * Возвращает ссылку на родительский объект.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/IControl.xml#getParent
     * @function
     * @name CrossControl.getParent
     * @returns {IControlParent} Ссылка на родительский объект.
     */
    getParent: function () {
        return this.parent;
    },
    /**
     * Устанавливает контролу опцию "position".
     * @function
     * @private
     * @name CrossControl._setPosition
     * @param {Array} size Размер контейнера карты.
     */
    _setPosition: function (size) {
        // -8, так как картинка 16х16
        this.options.set('position', {
            top: size[1] / 2 - 8,
            right: size[0] / 2 - 8
        });
    },
    _onPositionChange: function (e) {
        this._setPosition(e.get('newSize'));
    },
    _setupListeners: function () {
        this._map.container.events
            .add('sizechange', this._onPositionChange, this);
    },
    _clearListeners: function () {
        if(this._map) {
            this._map.container.events
                .remove('sizechange', this._onPositionChange, this);
        }
    }
};
