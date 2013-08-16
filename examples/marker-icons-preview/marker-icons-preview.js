function IconsPreview(map) {
    this._model = new IconsPreview.Model();
    this._modalView = new IconsPreview.ModalView($('.modal'));
    this._settingsView = new IconsPreview.SettingsView($('#settings'));
    this._mapView = new IconsPreview.MapView(map);

    this._mapView.render();
    this._attachHandlers();
}

IconsPreview.prototype = {
    constructor: IconsPreview,
    _attachHandlers: function () {
        this._model.events
            .on('requestsuccess', $.proxy(this._onData, this))
            .on('requestfailed', $.proxy(this._onError, this));

        this._settingsView.events
            .on('actionselected', $.proxy(this._onAction, this));

        this._modalView.events
            .on('styleselected', $.proxy(this._onStyleSelected, this));
    },
    _detachHandlers: function () {
        this._modalView.events
            .off('styleselected');

        this._settingsView.events
            .off('actionselected');

        this._model.events
            .off('requestfailed')
            .off('requestsuccess');
    },
    _onData: function (e) {
        this._modalView
            .clear()
            // .render(this._model.getResults());
            .render(e.results)
            .showModal();
    },
    _onError: function (e) {
        if(window.console) {
            // console.log(this._model.getError());
            console.log(e.message);
        }
    },
    _onAction: function (e) {
        var action = e.action;

        if(action === 'clear-map') {
            this._mapView
                .clear()
        }
        else {
            this._model
                .load(action + '.json')
        }
    },
    _onStyleSelected: function (e) {
        this._modalView
            .hideModal();

        this._mapView
            .render(e);
    }
};

IconsPreview.MapView = function (map) {
    this._map = map;
    this.events = new ymaps.event.Manager();
    this._clusterer = this._createClusterer();
    this._markerStyle = null;
    this._clusterStyle = null;
    this._generator = new RandomPointsGenerator();
    this._points = this._createMarkers();
};

IconsPreview.MapView.prototype = {
    constructor: IconsPreview.MapView,
    render: function (data) {
        this._map.geoObjects.add(
            this._clusterer.add(
                this._points ||
                    (this._points = this._createMarkers())
            )
        );

        data && this._setStyles(data);

        return this;
    },
    clear: function () {
        this._map.geoObjects.remove(
            this._clusterer.removeAll()
        );

        this._points = null;

        return this;
    },
    _setStyles: function (data) {
        if(data.markerStyle) {
            this._setMarkerStyle(
                this._markerStyle = data.markerStyle
            );
        }
        if(data.clusterStyle) {
            this._setClusterStyle(
                this._clusterStyle = data.clusterStyle
            );
        }
    },
    _setClusterStyle: function (style) {
        this._clusterer.options.set('preset', style);
    },
    _setMarkerStyle: function (style) {
        for(var i = 0, len = this._points.length; i < len; i++) {
            this._points[i].options.set('preset', style);
            this._points[i].properties.set('iconContent',  ~style.indexOf('Stretchy') && 'Контент' || '');
        }
    },
    _createMarkers: function () {
        return this._generator.generate(100).atBounds(
            this._map.getBounds()
        );
    },
    _createClusterer: function () {
        return new ymaps.Clusterer();
    }
};

IconsPreview.Model = function () {
    this.events = $({});
    this._results = null;
    this._error = null;
};

IconsPreview.Model.prototype = {
    constructor: IconsPreview.Model,
    load: function (url) {
        this.clear();

        $.ajax(
            $.extend({
                success: this._onRequestSuccess,
                error: this._onRequestFailed,
                context: this
            }, this.getDefaults(), { url: url })
        );

        return this;
    },
    clear: function () {
        this._results = null;
        this._error = null;

        return this;
    },
    _onRequestSuccess: function (data) {
        this._results = data;

        this.events.trigger($.Event('requestsuccess', {
            results: data
        }));
    },
    _onRequestFailed: function (xhr, errorType, message) {
        this._error = errorType + (message? ': ' + message: '')

        this.events.trigger($.Event('requestfailed', {
            message: this._error
        }));
    },
    getResults: function () {
        return this._results;
    },
    getError: function () {
        return this._error;
    },
    getDefaults: function () {
        return {
            url: 'marker-styles.json',
            dataType: 'json'
        };
    }
};

IconsPreview.SettingsView = function (container) {
    this._container = container;
    this.events = $({});

    this._attachHandlers();
};

IconsPreview.SettingsView.prototype = {
    constructor: IconsPreview.SettingsView,
    _attachHandlers: function () {
        this._container
            .on('click', '.btn', $.proxy(this._onBtnClick, this));
    },
    _detachHandlers: function () {
        this._container
            .off('click');
    },
    _onBtnClick: function (e) {
        this.events.trigger($.Event('actionselected', {
            action: $(e.target).attr('data-action')
        }));
    }
};

IconsPreview.ModalView = function (container) {
    this._container = container;
    this.events = $({});
};

IconsPreview.ModalView.prototype = {
    constructor: IconsPreview.ModalView,
    render: function (data) {
        var styles = data.styles;

        this._setTitle(data.title);

        for(var i = 0, len = styles.length; i < len; i++) {
            this._container.find('.modal-body')
                .append(this._createTitle(styles[i].title))
                .append(this._createTable(styles[i].keys));
        }

        this._attachHandlers();

        return this;
    },
    clear: function () {
        this._detachHandlers();
        this._container.find('.modal-body')
            .empty();

        return this;
    },
    showModal: function () {
        this._container
            .modal('show');

        return this;
    },
    hideModal: function () {
        this._container
            .modal('hide');

        return this;
    },
    _attachHandlers: function () {
        this._container
            .on('click', 'tr', $.proxy(this._onRowClick, this));
    },
    _detachHandlers: function () {
        this._container
            .off('click');
    },
    _setTitle: function (title) {
        this._container.find('title')
            .text(title);

        return this;
    },
    _onRowClick: function (e) {
        var target = $(e.currentTarget),
            eventObject = {},
            type = target.attr('data-type'),
            style = target.find('td:last').text();

        eventObject[type] = style;

        this.events.trigger($.Event('styleselected', eventObject));
    },
    _createTitle: function (text) {
        var title = [
                '<p class="lead">',
                    text,
                '</p>'
            ];

        return title.join('');
    },
    _createTable: function (data) {
        var table = [
                '<table class="table table-bordered table-hover">',
                    this._createTableHead(data),
                    this._createTableBody(data),
                '</table>'
            ];

        return table.join('');
    },
    _createTableRow: function (key) {
        var template = [
                '<tr data-type="%s">',
                    '<td><img src="%s"/></td>',
                    '<td>%s</td>',
                '</tr>'
            ].join(''),
            preset = ymaps.option.presetStorage.get(key),
            url = preset.iconImageHref || preset.clusterIcons[0].href,
            type = preset.iconImageHref && 'markerStyle' || 'clusterStyle';

        return template
            .replace('%s', type)
            .replace('%s', url)
            .replace('%s', key);
    },
    _createTableHead: function (data) {
        var thead = [
                '<thead>',
                    '<tr>',
                        '<th>Значок</th>',
                        '<th>Ключ</th>',
                    '</tr>',
                '</thead>'
            ];

        return thead.join('');
    },
    _createTableBody: function (data) {
        var tbody = [
            '<tbody>',
            '</tbody>'
        ];

        for(var i = 0, len = data.length; i < len; i++) {
            tbody.splice(tbody.length - 1, 0, this._createTableRow(data[i]));
        }

        return tbody.join('');
    }
};
