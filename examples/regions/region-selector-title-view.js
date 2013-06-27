/**
 * Класс-отображение заголовка.
 * @class
 * @name RegionSelector.TitleView
 * @param {jQuery} container Родителький элемент контрола.
 */
RegionSelector.TitleView = function (container) {
    this._container = container;
    this._template = '<p><a href="#">%s</a></p>';
    this.events = $({});
};

/**
 * @lends RegionSelector.TitleView.prototype
 */
RegionSelector.TitleView.prototype = {
    /**
     * @constructor
     */
    constructor: RegionSelector.TitleView,
    /**
     * Отображение данных в DOM-дереве.
     * @function
     * @name RegionSelector.TitleView.render
     * @param {ymaps.data.Manager} data Данные регионов.
     * @returns {RegionSelector.TitleView} Возвращает ссылку на себя.
     */
    render: function (data) {
        var title = data.get('regions').properties.get('hintContent');

        this._container
            .append(this._template.replace('%s', title));
        this._attachHandlers();

        return this;
    },
    /**
     * Удаление данных из DOM-дерева.
     * @function
     * @name RegionSelector.TitleView.clear
     * @returns {RegionSelector.TitleView} Возвращает ссылку на себя.
     */
    clear: function () {
        this._detachHandlers();
        this._container.empty();

        return this;
    },
    /**
     * Добавление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.TitleView._attachHandlers
     */
    _attachHandlers: function () {
        this._container.on('click', 'a', $.proxy(this._onTitleClick, this));
    },
    /**
     * Удаление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.TitleView._detachHandlers
     */
    _detachHandlers: function () {
        this._container.off('click');
    },
    /**
     * Обработчик клика на заголовке.
     * @function
     * @private
     * @name RegionSelector.TitleView._onTitleClick
     * @param {jQuery.Event} e Объект-событие.
     */
    _onTitleClick: function (e) {
        e.preventDefault();

        this.events.trigger($.Event('titleclick'));
    }
};
