/**
 * Класс-отображение списка регионов.
 * @class
 * @name RegionSelector.ListView
 * @param {jQuery} container Родительский элемент списка.
 */
RegionSelector.ListView = function (container) {
    this._container = container;
    this._template = '<li><a href="#">%s</a></li>';
    this._activeItem = null;
    this.events = $({});
};

/**
 * @lends RegionSelector.ListView.prototype
 */
RegionSelector.ListView.prototype = {
    /**
     * @constructor
     */
    constructor: RegionSelector.ListView,
    /**
     * Отображение данных в DOM-дереве.
     * @function
     * @name RegionSelector.ListView.render
     * @param {ymaps.data.Manager} data Данные регионов.
     * @returns {RegionSelector.ListView} Возвращает ссылку на себя.
     */
    render: function (data) {
        data.get('regions')
            .each(this._onEveryRegion, this);

        this._sortItems();
        this._attachHandlers();

        return this;
    },
    /**
     * Удаление данных из DOM-дерева.
     * @function
     * @name RegionSelector.ListView.clear
     * @returns {RegionSelector.ListView} Возвращает ссылку на себя.
     */
    clear: function () {
        this._detachHandlers();
        this._container.empty();

        return this;
    },
    /**
     * Сортировка DOM-элементов списка в алфавитном порядке.
     * @function
     * @private
     * @name RegionSelector.ListView._sortItems
     */
    _sortItems: function () {
        this._container.append(
            this._container.children().sort(function (a, b) {
                return $(a).find('a').text() > $(b).find('a').text() ? 1 : -1;
            })
        );
    },
    /**
     * Добавление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.ListView._attachHandlers
     */
    _attachHandlers: function () {
        this._container.on('click', 'li', $.proxy(this._onItemSelected, this));
    },
    /**
     * Удаление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.ListView._detachHandlers
     */
    _detachHandlers: function () {
        this._container.off('click');
    },
    /**
     * Обработчик клика на элементе списка.
     * @function
     * @private
     * @name RegionSelector.ListView._onItemSelected
     * @param {jQuery.Event} e Объект-событие.
     */
    _onItemSelected: function (e) {
        e.preventDefault();

        var index = $(e.currentTarget).data('index');

        this.unsetActiveItem()
            .setActiveItem(index);
        this.events.trigger($.Event('itemselected', {
            itemIndex: index
        }));
    },
    /**
     * Выделить элемент списка.
     * @function
     * @name RegionSelector.ListView.setActiveItem
     * @param {Number} index Порядковый номер элемента в списке.
     * @returns {RegionSelector.ListView} Возвращает ссылку на себя.
     */
    setActiveItem: function (index) {
        this._activeItem = this._findItem(index)
            .addClass('active');

        return this;
    },
    /**
     * Снять выделение элемента списка.
     * @function
     * @name RegionSelector.ListView.unsetActiveItem
     * @returns {RegionSelector.ListView} Возвращает ссылку на себя.
     */
    unsetActiveItem: function () {
        if(this._activeItem) {
            this._activeItem
                .removeClass('active');
            this._activeItem = null;
        }

        return this;
    },
    /**
     * Скроллим список к выбранному элементу.
     * @function
     * @name RegionSelector.ListView.scrollToItem
     * @param {Number} index Порядковый номер элемента в списке.
     * @returns {RegionSelector.ListView} Возвращает ссылку на себя.
     */
    scrollToItem: function (index) {
        var item = this._findItem(index),
            position = item.offset().top - this._container.offset().top;

        this._container.parent()
            .scrollTop(position);

        return this;
    },
    /**
     * Поиск (фильтрация) выбранного элемента в списке по индексу.
     * @function
     * @private
     * @name RegionSelector.ListView._findItem
     * @param {Number} index Порядковый номер элемента в списке.
     * @returns {RegionSelector.ListView} Возвращает ссылку на себя.
     */
    _findItem: function (index) {
        return this._container.children()
            .filter(function () {
                return $(this).data('index') == index;
            });
    },
    /**
     * Итератор по элементам геоколлекции.
     * @function
     * @private
     * @name RegionSelector.ListView._onEveryRegion
     * @param {ymaps.Polygon} region Геообъект региона.
     * @param {Number} index Порядковый номер элемента в геоколлекции.
     */
    _onEveryRegion: function (region, index) {
        this._container.append(
            $(
                this._template
                    .replace('%s', region.properties.get('hintContent'))
            ).data('index', index)
        );
    }
};
