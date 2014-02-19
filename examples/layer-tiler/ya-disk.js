function YaDisk() {
    this._model = new YaDisk.Model();
}

YaDisk.prototype = {
    constructor: YaDisk,
    getModel: function () {
        return this._model;
    }
};

YaDisk.Model = function (options) {
    this._options = $.extend({}, this.getDefaults(), options);
    this.events = $({});
};

YaDisk.Model.prototype = {
    constructor: YaDisk.Model,
    list: function (path, options) {
        var options = this._options;

        $.ajax(
            $.extend({}, options, {
                success: this._onSuccess,
                error: this._onError,
                context: this
            })
        );
    },
    _onSuccess: function () {
        console.log(arguments);
    },
    _onError: function () {
        console.log(arguments);
    },
    getDefaults: function () {
        return {
            url: 'https://webdav.yandex.ru',
            type: 'PROPFIND',
            dataType: 'xml',
            headers: {
                Authorization: 'OAuth c5a90c24062242889b23459a0c15ff53',
                Depth: '1'
            }
        };
    }
};
