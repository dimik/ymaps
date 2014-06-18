ymaps.modules.define('app', [
    'inherit',
    'mapstate-ctrl'
], function (provide, inherit, MapStateCtrl) {

var App = inherit({
    __constructor: function () {
        var mapState = new MapStateCtrl();
    }
});

provide(App);

});
