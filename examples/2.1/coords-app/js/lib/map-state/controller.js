ymaps.modules.define('mapstate-ctrl', [
    'inherit',
    'mapstate-model',
    'mapstate-view',
    'Monitor'
], function (provide, inherit, Model, View, Monitor) {

var MapStateCtrl = inherit({
    __constructor: function () {
        var model = this._model = new Model();
        var view = this._view = new View();

        view.render(model.state.getAll());
        this._monitor = new Monitor(model.state);
        this._setupMonitor();
    },
    /**
     * Настраиваем монитор для наблюдения за интересующими нас полями.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Monitor.xml
     * @private
     * @function
     * @name MapStateCtrl._setupMonitor
     */
    _setupMonitor: function () {
        this._monitor
            .add(['center', 'zoom'], this._onMapStateChange, this);
    },
    /**
     * Останавливаем наблюдение.
     * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Monitor.xml#removeAll
     * @private
     * @function
     * @name MapStateCtrl._clearMonitor
     */
    _clearMonitor: function () {
        this._monitor
            .removeAll();
    },
    /**
     * Обработчик изменения полей.
     * @private
     * @function
     * @name MapStateCtrl._onMapViewStateChange
     */
    _onMapStateChange: function (data) {
        this._view.render(data);
    }
});

provide(MapStateCtrl);

});
