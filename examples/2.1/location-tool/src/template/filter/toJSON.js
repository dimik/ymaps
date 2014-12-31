ym.modules.define('template.filter.toJSON', [
    'template.filtersStorage'
], function (provide, filtersStorage) {

    var toJSON = function (data, value, param) {
        return JSON.stringify(value);
    };

    filtersStorage.add('toJSON', toJSON);

    provide(filtersStorage);
});
