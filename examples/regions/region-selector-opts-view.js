/**
 * Класс-отображения контролов настроек.
 * @class
 * @name RegionSelector.OptsView
 * @param {jQuery} container Родительский элемент контролов настроек.
 */
RegionSelector.OptsView = function (container) {
    this._container = container;
    this._btnTemplate = [
        '<div class="btn-group">',
            '<a class="btn btn-primary dropdown-toggle" data-toggle="dropdown" href="#">',
                '%s',
                '&nbsp;<span class="caret"></span>',
            '</a>',
            '<ul class="dropdown-menu"></ul>',
        '</div>'
    ].join('');
    this._itemTemplate = '<li><a href="#">%s</a></li>';
    this._activeIconTemplate = '<i class="icon-ok"></i>';
    this.events = $({});
};

/**
 * @lends RegionSelector.OptsView.prototype
 */
RegionSelector.OptsView.prototype = {
    /**
     * @constructor
     */
    constructor: RegionSelector.OptsView,
    /**
     * Отображение контролов настроек в DOM-дереве.
     * @function
     * @name RegionSelector.OptsView.render
     * @param {ymaps.data.Manager} data Менеджер данных.
     * @returns {RegionSelector.OptsView} Возвращает ссылку на себя.
     */
    render: function (data) {
        var labels = this.constructor.LABELS,
            options = data.get('regions').properties.getAll();

        for(var key in labels) {
            var option = labels[key],
                btn = $(
                    this._btnTemplate
                        .replace('%s', option.label)
                );

            for(var value in option.values) {
                var label = option.values[value],
                    item = $(
                        this._itemTemplate
                            .replace('%s', label)
                    )
                    .data(key, value);

                if(options[key] == value) {
                    item.find('a')
                        .prepend(this._activeIconTemplate);
                }

                btn.find('ul')
                    .append(item);
            }
            this._container
                .append(btn);
        }

        this._attachHandlers();

        return this;
    },
    /**
     * Удаление контролов настроек из DOM-дерева.
     * @function
     * @name RegionSelector.OptsView.clear
     * @returns {RegionSelector.OptsView} Возвращает ссылку на себя.
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
     * @name RegionSelector.OptsView._attachHandlers
     */
    _attachHandlers: function () {
        this._container.on('click', 'li', $.proxy(this._onItemClick, this));
    },
    /**
     * Удаление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.OptsView._detachHandlers
     */
    _detachHandlers: function () {
        this._container.off();
    },
    /**
     * Обработчик клика на конроле настроек.
     * @function
     * @name RegionSelector.OptsView._onItemClick
     * @param {jQuery.Event} e Объект-событие.
     */
    _onItemClick: function (e) {
        e.preventDefault();

        var item = $(e.currentTarget);

        this.unsetActiveItem(item.parent())
            .setActiveItem(item);

        this.events.trigger($.Event('optionschange', {
            options: item.data()
        }));
    },
    /**
     * Выделить элемент списка контрола.
     * @function
     * @name RegionSelector.OptsView.setActiveItem
     * @param {jQuery} item Элемент списка контрола.
     * @returns {RegionSelector.OptsView} Возвращает ссылку на себя.
     */
    setActiveItem: function (item) {
        item.find('a')
            .prepend($(this._activeIconTemplate));

        return this;
    },
    /**
     * Снять выделение элемента списка контрола.
     * @function
     * @name RegionSelector.OptsView.unsetActiveItem
     * @param {jQuery} container Родительский элемент.
     * @returns {RegionSelector.OptsView} Возвращает ссылку на себя.
     */
    unsetActiveItem: function (container) {
        container.find('.icon-ok')
            .remove();

        return this;
    }
};

/**
 * Заголовки контролов.
 * @static
 * @constant
 */
RegionSelector.OptsView.LABELS = {
    country: {
        label: 'Страна',
        values: {
            RU: 'Россия',
            UA: 'Украина',
            BY: 'Белоруссия',
            KZ: 'Казахстан'
        }
    },
    lang: {
        label: 'Язык',
        values: {
            ru: 'русский',
            uk: 'украинский',
            be: 'белорусский',
            en: 'английский'
        }
    },
    level: {
        label: 'Уровень качества',
        values: [
            'низкий',
            'средний',
            'высокий',
            'максимальный'
        ]
    }
};
