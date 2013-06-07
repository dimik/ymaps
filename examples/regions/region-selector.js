function RegionSelector(map, listContainer, optContainer) {
    this._model = new RegionSelector.Model();
    this._listView = new RegionSelector.ListView(listContainer);
    this._optsView = new RegionSelector.OptsView(optContainer);
    this._mapView = new RegionSelector.MapView(map);

    this._attachHandlers();
    this._model.load();
    this._optsView.render({
        country: this._model.constructor.COUNTRIES,
        lang: this._model.constructor.LANGUAGES,
        level: this._model.constructor.LEVELS
    });
}

RegionSelector.prototype = {
    constructor: RegionSelector,
    _attachHandlers: function () {
        this._model.events.add('load', this._onRegionsLoaded, this);
        this._mapView.events.add('regionselected', this._onRegionSelected, this);
        this._listView.events.on('itemselected', $.proxy(this._onItemSelected, this));
        this._optsView.events.on('optionschange', $.proxy(this._onOptionsChange, this));
    },
    _detachHandlers: function () {
        this._optsView.events.off();
        this._listView.events.off();
        this._mapView.events.remove('regionselected', this._onRegionSelected, this);
        this._model.events.remove('load', this._onRegionsLoaded, this);
    },
    _onRegionsLoaded: function (data) {
        this._listView
            .clear()
            .render(data);
        this._mapView
            .clear()
            .render(data);
    },
    _onRegionSelected: function (e) {
        this._listView
            .unsetActiveItem()
            .setActiveItem(e.get('index'));
    },
    _onItemSelected: function (e) {
        var index = e.itemIndex;

        this._mapView
            .unsetActiveItem()
            .setActiveItem(index);
    },
    _onOptionsChange: function (e) {
        this._model.options.set(e.options);
    }
};

RegionSelector.MapView = function (map) {
    this._map = map;
    this._regions = null;
    this._activeItem = null;
    this.events = new ymaps.event.Manager();
}

RegionSelector.MapView.prototype = {
    constructor: RegionSelector.MapView,
    _attachHandlers: function () {
        this._regions.events.add('mouseenter', this._onMouseEnter, this);
        this._regions.events.add('mouseleave', this._onMouseLeave, this);
    },
    _detachHandlers: function () {
        this._regions.events.remove('mouseleave', this._onMouseLeave, this);
        this._regions.events.remove('mouseenter', this._onMouseEnter, this);
    },
    _onMouseEnter: function (e) {
        var region = e.get('target'),
            index = this._regions.indexOf(region);

        region.options.set('preset', this.constructor.SELECTED_PRESET);
        this.events.fire('regionselected', {
            index: index
        });
    },
    _onMouseLeave: function (e) {
        e.get('target')
            .options.set('preset', '');
    },
    render: function (data) {
        this._map.geoObjects.add(
            this._regions = data.get('regions')
        );
        this._map.setBounds(this._regions.getBounds());
        this._regions.options.set({
            zIndex: 1,
            zIndexHover: 1
        });
        this._attachHandlers();

        return this;
    },
    clear: function () {
        if(this._regions) {
            this._detachHandlers();
            this._map.geoObjects.remove(this._regions);
            this._regions = null;
            this._activeItem = null;
        }

        return this;
    },
    setActiveItem: function (index) {
        var region = this._activeItem = this._regions.get(index);

        region.options.set('preset', this.constructor.SELECTED_PRESET);
        this._map.setBounds(region.geometry.getBounds()/*, {
            duration: 1000
        }*/);

        return this;
    },
    unsetActiveItem: function () {
        if(this._activeItem) {
            this._activeItem.options.set('preset', '');
            this._activeItem = null;
        }

        return this;
    }
};

RegionSelector.MapView.SELECTED_PRESET = {
    strokeWidth: 3,
    fillColor: 'F99',
    strokeColor: '9F9'
};

RegionSelector.ListView = function (container) {
    this._container = container;
    this._template = '<li><a href="#">%s</a></li>';
    this.events = $({});
};

RegionSelector.ListView.prototype = {
    constaructor: RegionSelector.ListView,
    render: function (data) {
        var regions = data.get('regions');

        regions.each(this._onEveryRegion, this);
        this._attachHandlers();

        return this;
    },
    clear: function () {
        this._detachHandlers();
        this._container.empty();

        return this;
    },
    _attachHandlers: function () {
        this._container.on('click', 'li', $.proxy(this._onItemSelected, this));
    },
    _detachHandlers: function () {
        this._container.off('click');
    },
    _onItemSelected: function (e) {
        e.preventDefault();

        var item = this._activeItem = $(e.currentTarget),
            index = this._container.children().index(item);

        item.addClass('active');
        this.events.trigger($.Event('itemselected', {
            itemIndex: index
        }));
    },
    setActiveItem: function (index) {
        (this._activeItem = this._container.children().eq(index))
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
    _onEveryRegion: function (region) {
        this._container.append(
            this._template.replace('%s', region.properties.get('hintContent'))
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
        for(var key in data) {
            var option = data[key],
                btn = $(
                    this._btnTemplate
                        .replace('%s', this.constructor.LABELS[key])
                );

            for(var i = 0, len = option.length; i < len; i++) {
                var value = option[i],
                    item = $(
                        this._itemTemplate
                            .replace('%s', this.constructor.OPTION_LABELS[key][value])
                    )
                    .data(key, value);

                btn.find('ul')
                    .append(item);
            }
            this._container
                .append(btn);
        }

        this._attachHandlers();
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
    country: 'Страна',
    lang: 'Язык',
    level: 'Уровень качества'
};

RegionSelector.OptsView.OPTION_LABELS = {
    country: {
        RU: 'Россия',
        UA: 'Украина',
        BY: 'Белоруссия',
        KZ: 'Казахстан'
    },
    lang: {
        ru: 'русский',
        uk: 'украинский',
        be: 'белорусский',
        en: 'английский'
    },
    level: [
        'низкий',
        'средний',
        'высокий',
        'максимальный'
    ]
};

RegionSelector.Model = function () {
    this.events = new ymaps.event.Manager();
    this.options = new ymaps.option.Manager({
        preset: this.getDefaults()
    });
    this._monitor = new ymaps.Monitor(this.options);

    this._setupMonitor();
}

RegionSelector.Model.prototype = {
    constructor: RegionSelector.Model,
    _setupMonitor: function () {
        this._monitor
            .add(['country', 'lang', 'level'], this._onOptionsChanged, this);
    },
    _clearMonitor: function () {
        this._monitor
            .removeAll();
    },
    _onOptionsChanged: function () {
        this.load();
    },
    load: function () {
        ymaps.regions.load(
            this.options.get('country'),
            this.options.getAll()
        ).then(
            ymaps.util.bind(this._onDataLoaded, this)
        );
    },
    _onDataLoaded: function (data) {
        this.events.fire('load', {
            regions: data.geoObjects,
            target: this
        });
    },
    getDefaults: function () {
        return {
            country: this.constructor.COUNTRIES[0],
            lang: this.constructor.LANGUAGES[0],
            level: this.constructor.LEVELS[0]
        };
    }
}

/**
 * Доступные страны:
 * Россия, Украина, Белоруссия, Казахстан.
 * @constant
 */
RegionSelector.Model.COUNTRIES = ['RU', 'UA', 'BY', 'KZ'];
/**
 * Доступные языки:
 * русский, украинский, белорусский, английский.
 * @constant
 */
RegionSelector.Model.LANGUAGES = ['ru', 'uk', 'be', 'en'];
/**
 * Доступные уровни качества геометрии:
 * @constant
 */
RegionSelector.Model.LEVELS = [0, 1, 2, 3];
