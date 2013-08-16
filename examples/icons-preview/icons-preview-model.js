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
