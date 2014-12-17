ym.modules.define('LocationTool', [
    'util.defineClass',
    'Monitor',
    'LocationTool.component.MapView',
    'LocationTool.component.DomView'
], function (provide, defineClass, Monitor, MapView, DOMView) {
    /**
     * Класс Инструмент определения координат.
     * @class
     * @name LocationTool
     * @param {ymaps.Map} map Карта.
     */
    var LocationTool = defineClass(function (map) {
        this._domView = new DOMView();
        this._mapView = new MapView(map);
        this._monitor = new Monitor(this._mapView.state);
        this._setupMonitor();
        this._initDOMView();
    }, /** @lends LocationTool.prototype */{
        /**
         * Инициализирует DOMView начальными значениями карты.
         * @private
         * @function
         * @name LocationTool._initView
         */
        _initDOMView: function () {
            this._domView.render(this._mapView.state.getAll());
        },
        /**
         * Настраиваем монитор для наблюдения за интересующими нас полями.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Monitor.xml
         * @private
         * @function
         * @name LocationTool._setupMonitor
         */
        _setupMonitor: function () {
            this._monitor
                .add(['mapCenter', 'mapZoom', 'markerPosition'], this._onMapViewStateChange, this);
        },
        /**
         * Останавливаем наблюдение.
         * @see http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/Monitor.xml#removeAll
         * @private
         * @function
         * @name LocationTool._clearMonitor
         */
        _clearMonitor: function () {
            this._monitor
                .removeAll();
        },
        /**
         * Обработчик изменения полей.
         * @private
         * @function
         * @name LocationTool._onMapViewStateChange
         */
        _onMapViewStateChange: function (data) {
            this._domView.render(data);
        }
    });

    provide(LocationTool);
});
