/**
 * Класс-контрол выбора региона
 * @class
 * @name RegionSelector
 * @param [ymaps.Map] map Карта.
 * @param [jQuery] listContainer Контейнер списка областей.
 * @param [jQuery] optContainer Контейнер для настроек.
 */
function RegionSelector(map, listContainer, optContainer) {
    this._model = new RegionSelector.Model();
    this._views = [
        this._listView = new RegionSelector.ListView(listContainer),
        this._optsView = new RegionSelector.OptsView(optContainer),
        this._mapView = new RegionSelector.MapView(map),
        this._mapMaskView = new RegionSelector.MapMaskView(map)
    ];

    this._attachHandlers();
    this._model.load();
}

/**
 * @lends RegionSelector.prototype
 */
RegionSelector.prototype = {
    /**
     * @constructor
     */
    constructor: RegionSelector,
    /**
     * Добавление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector._attachHandlers
     */
    _attachHandlers: function () {
        this._model.events.add('load', this._onRegionsLoaded, this);
        this._mapView.events.add('itemselected', this._onMapItemSelected, this);
        this._listView.events.on('itemselected', $.proxy(this._onListItemSelected, this));
        this._optsView.events.on('optionschange', $.proxy(this._onOptionsChange, this));
    },
    /**
     * Удаление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector._detachHandlers
     */
    _detachHandlers: function () {
        this._optsView.events.off();
        this._listView.events.off();
        this._mapView.events.remove('regionselected', this._onRegionSelected, this);
        this._model.events.remove('load', this._onRegionsLoaded, this);
    },
    /**
     * Обработчик события загрузки данных о регионах.
     * @function
     * @private
     * @name RegionSelector._onRegionsLoaded
     * @param [ymaps.data.Manager] data Менеджер данных.
     */
    _onRegionsLoaded: function (data) {
        for(var i = 0, len = this._views.length; i < len; i++) {
            this._views[i]
                .clear()
                .render(data);
        }
    },
    /**
     * Обработчик выбора региона на карте.
     * @function
     * @private
     * @name RegionSelector._onMapItemSelected
     * @param [ymaps.data.Manager] e Менеджер данных.
     */
    _onMapItemSelected: function (e) {
        var index = e.get('index');

        this._listView
            .unsetActiveItem()
            .setActiveItem(index)
            .scrollToItem(index);
    },
    /**
     * Обработчик выбора региона в списке.
     * @function
     * @private
     * @name RegionSelector._onListItemSelected
     * @param [jQuery.Event] e Объект-событие.
     */
    _onListItemSelected: function (e) {
        var index = e.itemIndex;

        this._mapView
            .unsetActiveItem()
            .setActiveItem(index);
    },
    /**
     * Обработчик смены настроек.
     * @function
     * @private
     * @name RegionSelector._onOptionsChange
     * @param [jQuery.Event] e Объект-событие.
     */
    _onOptionsChange: function (e) {
        this._model.options.set(e.options);
    }
};

RegionSelector.HeaderView = function (container) {
    this._container = container;
    this._template = '<h3><a href="#">%s</a></h3>';
};

RegionSelector.HeaderView.prototype = {
    constaructor: RegionSelector.ListView,
    render: function (data) {
        var regions = data.get('regions');

        this._attachHandlers();

        return this;
    },
    clear: function () {
        this._detachHandlers();
        this._container.empty();

        return this;
    },
    _attachHandlers: function () {
        this._container.on('click', 'a', $.proxy(this._onHeaderClick, this));
    },
    _detachHandlers: function () {
        this._container.off('click');
    },
    _onHeaderClick: function (e) {
        e.preventDefault();


    }
};

RegionSelector.ListView = function (container) {
    this._container = container;
    this._template = '<li><a href="#">%s</a></li>';
    this._activeItem = null;
    this.events = $({});
};

RegionSelector.ListView.prototype = {
    constaructor: RegionSelector.ListView,
    render: function (data) {
        var regions = data.get('regions');

        regions.each(this._onEveryRegion, this);
        this._sortItems();
        this._attachHandlers();

        return this;
    },
    clear: function () {
        this._detachHandlers();
        this._container.empty();

        return this;
    },
    _sortItems: function () {
        this._container.append(
            this._container.children().sort(function (a, b) {
                return $(a).find('a').text() > $(b).find('a').text() ? 1 : -1;
            })
        );
    },
    _attachHandlers: function () {
        this._container.on('click', 'li', $.proxy(this._onItemSelected, this));
    },
    _detachHandlers: function () {
        this._container.off('click');
    },
    _onItemSelected: function (e) {
        e.preventDefault();

        var index = $(e.currentTarget).data('index');

        this.unsetActiveItem()
            .setActiveItem(index);
        this.events.trigger($.Event('itemselected', {
            itemIndex: index
        }));
    },
    setActiveItem: function (index) {
        this._activeItem = this._findItem(index)
            .addClass('active');

        return this;
    },
    unsetActiveItem: function () {
        if(this._activeItem) {
            this._activeItem
                .removeClass('active');
            this._activeItem = null;
        }

        return this;
    },
    scrollToItem: function (index) {
        var item = this._findItem(index),
            position = item.offset().top - this._container.offset().top;

        this._container.parent()
            .scrollTop(position);

        return this;
    },
    _findItem: function (index) {
        return this._container.children()
            .filter(function () {
                return $(this).data('index') == index;
            });
    },
    _onEveryRegion: function (region, index) {
        this._container.append(
            $(
                this._template
                    .replace('%s', region.properties.get('hintContent'))
            ).data('index', index)
        );
    },
};

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

RegionSelector.OptsView.prototype = {
    constructor: RegionSelector.OptsView,
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
    clear: function () {
        this._detachHandlers();
        this._container.empty();

        return this;
    },
    _attachHandlers: function () {
        this._container.on('click', 'li', $.proxy(this._onItemClick, this));
    },
    _detachHandlers: function () {
        this._container.off();
    },
    _onItemClick: function (e) {
        e.preventDefault();

        var item = $(e.currentTarget);

        this.unsetActiveItem(item.parent())
            .setActiveItem(item);

        this.events.trigger($.Event('optionschange', {
            options: item.data()
        }));
    },
    setActiveItem: function (item) {
        item.find('a')
            .prepend($(this._activeIconTemplate));

        return this;
    },
    unsetActiveItem: function (container) {
        container.find('.icon-ok')
            .remove();

        return this;
    }
};

/**
 * Заголовки для контролов.
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
