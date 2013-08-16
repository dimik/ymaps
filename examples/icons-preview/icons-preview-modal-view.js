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
        this._container.find('h3')
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
            url = preset.iconImageHref ||
                (preset.clusterIcons && preset.clusterIcons[0].href) ||
                "http://api.yandex.ru/maps/doc/jsapi/2.x/ref/images/styles/" + key.match(/twirl#(.+)StretchyIcon/)[1] + "str.png",
            type = preset.clusterIcons && 'clusterStyle' || 'markerStyle';

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
