function MarkerIconsPreview(container) {
    this._model = new MarkerIconsPreview.Model();
    this._view = new MarkerIconsPreview.DOMView(container);

    this._attachHandlers();
    this._model.load();
}

MarkerIconsPreview.prototype = {
    constructor: MarkerIconsPreview,
    _attachHandlers: function () {
        this._model.events
            .on('requestsuccess', $.proxy(this._onData, this))
            .on('requestfailed', $.proxy(this._onError, this));
    },
    _detachHandlers: function () {
        this._model.events
            .off('requestfailed')
            .off('requestsuccess');
    },
    _onData: function (e) {
        this._view
            .clear()
            // .render(this._model.getResult());
            .render(e.presets);
    },
    _onError: function (e) {
        if(window.console) {
            // console.log(this._model.getError());
            console.log(e.message);
        }
    }
};

MarkerIconsPreview.Model = function () {
    this.events = $({});
    this._result = null;
    this._error = null;
};

MarkerIconsPreview.Model.prototype = {
    constructor: MarkerIconsPreview.Model,
    load: function () {
        this.clear();

        $.ajax(
            $.extend({
                success: this._onRequestSuccess,
                error: this._onRequestFailed,
                context: this
            }, this.getDefaults())
        );

        return this;
    },
    clear: function () {
        this._result = null;
        this._error = null;

        return this;
    },
    _onRequestSuccess: function (data) {
        this._result = data;

        this.events.trigger($.Event('requestsuccess', {
            presets: data
        }));
    },
    _onRequestFailed: function (xhr, errorType, message) {
        this._error = errorType + (message? ': ' + message: '')

        this.events.trigger($.Event('requestfailed', {
            message: this._error
        }));
    },
    getResult: function () {
        return this._result;
    },
    getError: function () {
        return this._error;
    },
    getDefaults: function () {
        return {
            url: 'data.json',
            dataType: 'json'
        };
    }
};

MarkerIconsPreview.DOMView = function (container) {
    this._container = container;
};

MarkerIconsPreview.DOMView.prototype = {
    constructor: MarkerIconsPreview.DOMView,
    render: function (data) {
        for(var i = 0, len = data.length; i < len; i++) {
            this._container
                .append(this._createTitle(data[i].title))
                .append(this._createTable(data[i].keys));
        }

        return this;
    },
    clear: function () {
        this._container.empty();

        return this;
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
                '<tr>',
                    '<td><img src="%s"/></td>',
                    '<td>"%s"</td>',
                '</tr>'
            ].join('');

        return template
            .replace('%s', ymaps.option.presetStorage.get(key).iconImageHref)
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
