define(['ready!ymaps'], function (ymaps) {

function BaseModel(options) {
    this._options = ymaps.util.extend({}, this.getDefaults(), options);
    this._result = null;
    this._error = null;
}

BaseModel.prototype = {
    constructor: BaseModel,
    getResult: function () {
        return this._result;
    },
    getError: function () {
        return this._error;
    },
    load: function () {
        var promise = new ymaps.vow.Promise();

        this._load.apply(this, arguments)
            .then(function (res) {
                promise.fulfill(
                    this._result = this.process(res)
                );
            }, function (err) {
                promise.reject(
                    this._error = err
                );
            }, this);

        return promise;
    },
    process: function (res) {
        return res;
    },
    getDefaults: function () {
        return {};
    }
};

return BaseModel;

});
