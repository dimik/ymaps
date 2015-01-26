ym.modules.define('template.filter.json', [
    'template.filtersStorage'
], function (provide, filtersStorage) {

    var toJSON = function (data, value, param) {
        return JSON.stringify(value);
    };

    filtersStorage.add('json', toJSON);

    provide(filtersStorage);
});
