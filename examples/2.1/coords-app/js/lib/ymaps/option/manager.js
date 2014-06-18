ymaps.modules.define('ymaps-option-manager', [
    'option.Manager',
    'ymaps-option-mapper'
], function (provide, DefaultOptionManager, mapper) {

function OptionManager(options, parent, name) {
    var manager = new DefaultOptionManager(options, parent, name);

    manager.resolve = function (key, name) {
        return this.get(mapper.resolve(key, name));
    };

    return manager;
}

provide(OptionManager);

});
