function RegionSelector(map, listContainer, optContainer) {
    this._model = new RegionSelector.Model();
    this._listView = new RegionSelector.ListView(listContainer);
    this._optsView = new RegionSelector.OptsView(optContainer);
    this._mapView = new RegionSelector.MapView(map);

    this._attachHandlers();
    this._model.load();
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
        [this._listView, this._mapView, this._optsView]
            .forEach(function (view) {
                view
                    .clear()
                    .render(data);
            });
    },
    _onRegionSelected: function (e) {
        var index = e.get('index');

        this._listView
            .unsetActiveItem()
            .setActiveItem(index)
            .scrollToItem(index);
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
            country: 'RU',
            lang: 'ru',
            level: 0
        };
    }
}
