ymaps.modules.define('jquery-config', [
    'ymaps-option-manager'
], function (provide, OptionManager) {

provide(new OptionManager({
    url: 'http://yandex.st/jquery/2.1.1/jquery.min.js'
}));

});
