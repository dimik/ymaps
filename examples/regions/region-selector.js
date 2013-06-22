/**
 * Класс-контрол выбора региона
 * @class
 * @name RegionSelector
 * @param {ymaps.Map} map Карта.
 * @param {jQuery} listContainer Контейнер списка областей.
 * @param {jQuery} optContainer Контейнер для настроек.
 * @param {jQuery} titleContainer Контейнер заголовка.
 */
function RegionSelector(map, listContainer, optContainer, titleContainer) {
    this._model = new RegionSelector.Model();
    this._views = [
        this._listView = new RegionSelector.ListView(listContainer),
        this._optsView = new RegionSelector.OptsView(optContainer),
        this._titleView = new RegionSelector.TitleView(titleContainer),
        this._mapView = new RegionSelector.MapView(map),
        this._mapMaskView = new RegionSelector.MapMaskView(map)
    ];

    this._attachHandlers();
    this._model.load();
}

/**
 * @lends RegionSelector.prototype
 */
RegionSelector.prototype = {
    /**
     * @constructor
     */
    constructor: RegionSelector,
    /**
     * Добавление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector._attachHandlers
     */
    _attachHandlers: function () {
        this._model.events.add('load', this._onRegionsLoaded, this);
        this._mapView.events.add('itemselected', this._onMapItemSelected, this);
        this._listView.events.on('itemselected', $.proxy(this._onListItemSelected, this));
        this._optsView.events.on('optionschange', $.proxy(this._onOptionsChange, this));
        this._titleView.events.on('titleclick', $.proxy(this._onTitleClick, this));
    },
    /**
     * Удаление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector._detachHandlers
     */
    _detachHandlers: function () {
        this._titleView.events.off();
        this._optsView.events.off();
        this._listView.events.off();
        this._mapView.events.remove('regionselected', this._onRegionSelected, this);
        this._model.events.remove('load', this._onRegionsLoaded, this);
    },
    /**
     * Обработчик события загрузки данных о регионах.
     * @function
     * @private
     * @name RegionSelector._onRegionsLoaded
     * @param {ymaps.data.Manager} data Менеджер данных.
     */
    _onRegionsLoaded: function (data) {
        for(var i = 0, len = this._views.length; i < len; i++) {
            this._views[i]
                .clear()
                .render(data);
        }
    },
    /**
     * Обработчик выбора региона на карте.
     * @function
     * @private
     * @name RegionSelector._onMapItemSelected
     * @param {ymaps.data.Manager} e Менеджер данных.
     */
    _onMapItemSelected: function (e) {
        var index = e.get('index');

        this._listView
            .unsetActiveItem()
            .setActiveItem(index)
            .scrollToItem(index);
    },
    /**
     * Обработчик выбора региона в списке.
     * @function
     * @private
     * @name RegionSelector._onListItemSelected
     * @param {jQuery.Event} e Объект-событие.
     */
    _onListItemSelected: function (e) {
        var index = e.itemIndex;

        this._mapView
            .unsetActiveItem()
            .setActiveItem(index)
            .setFocusOnRegion(index);
    },
    _onTitleClick: function (e) {
        this._mapView
            .unsetActiveItem()
            .setFocusOnRegions();
    },
    /**
     * Обработчик смены настроек.
     * @function
     * @private
     * @name RegionSelector._onOptionsChange
     * @param {jQuery.Event} e Объект-событие.
     */
    _onOptionsChange: function (e) {
        this._model.options.set(e.options);
    }
};
