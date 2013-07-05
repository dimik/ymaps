/**
 * Класс-отображение регионов на карте.
 * @class
 * @name RegionSelector.MapView
 * @param {ymaps.Map} map Карта.
 */
RegionSelector.MapView = function (map) {
    this._map = map;
    this._regions = null;
    this._activeItem = null;
    this.events = new ymaps.event.Manager();
};

/**
 * @lends RegionSelector.MapView.prototype
 */
RegionSelector.MapView.prototype = {
    /**
     * @constuctor
     */
    constructor: RegionSelector.MapView,
    /**
     * Добавление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.MapView._attachHandlers
     */
    _attachHandlers: function () {
        this._regions.events.add('click', this._onClick, this);
        this._regions.events.add('mouseenter', this._onMouseEnter, this);
    },
    /**
     * Удаление обработчиков событий.
     * @function
     * @private
     * @name RegionSelector.MapView._detachHandlers
     */
    _detachHandlers: function () {
        this._regions.events.remove('mouseenter', this._onMouseEnter, this);
        this._regions.events.remove('click', this._onClick, this);
    },
    /**
     * Обработчик клика на области региона.
     * @function
     * @private
     * @name RegionSelector.MapView._onClick
     * @param {ymaps.data.Manager} e Менеджер данных.
     */
    _onClick: function (e) {
        var region = e.get('target'),
            index = this._regions.indexOf(region);

        this
            .unsetActiveItem()
            .setActiveItem(index);

        this.events.fire('itemselected', {
            index: index
        });
    },
    /**
     * Отображение данных на карте.
     * @function
     * @name RegionSelector.MapView.render
     * @param {ymaps.data.Manager} data Менеджер данных.
     * @returns {RegionSelector.MapView} Возвращает ссылку на себя.
     */
    render: function (data) {
        this._map.geoObjects.add(
            this._regions = data.get('regions')
        );
        this.setFocusOnRegions();
        this._map.setBounds(this._regions.getBounds());
        this._regions.options.set({
            zIndex: 1,
            zIndexHover: 1,
            fillColor: RegionSelector.MapView.COLOR,
            strokeColor: RegionSelector.MapView.COLOR,
            strokeWidth: 1
        });
        this._attachHandlers();

        return this;
    },
    /**
     * Удаление данных с карты.
     * @function
     * @name RegionSelector.MapView.clear
     * @returns {RegionSelector.MapView} Возвращает ссылку на себя.
     */
    clear: function () {
        if(this._regions) {
            this._detachHandlers();
            this._map.geoObjects.remove(this._regions);
            this._regions = null;
            this._activeItem = null;
        }

        return this;
    },
    /**
     * Выделяем активный регион.
     * @function
     * @name RegionSelector.MapView.setActiveItem
     * @param {Number} index Индекс региона в коллекции.
     * @returns {RegionSelector.MapView} Возвращает ссылку на себя.
     */
    setActiveItem: function (index) {
        var region = this._activeItem = this._regions.get(index);

        region.options.set({
            fillColor: RegionSelector.MapView.SELECTED_COLOR,
            strokeColor: RegionSelector.MapView.SELECTED_COLOR
        });

        return this;
    },
    /**
     * Снимаем выделение активного региона.
     * @function
     * @name RegionSelector.MapView.unsetActiveItem
     * @returns {RegionSelector.MapView} Возвращает ссылку на себя.
     */
    unsetActiveItem: function () {
        if(this._activeItem) {
            this._activeItem.options.set({
                fillColor: RegionSelector.MapView.COLOR,
                strokeColor: RegionSelector.MapView.COLOR
            });
            this._activeItem = null;
        }

        return this;
    },
    /**
     * Выставляем карте область видимости на определенный регион.
     * @function
     * @name RegionSelector.MapView.setFocusOnRegion
     * @param {Number} index Порядковый номер региона в геоколлекции.
     * @returns {RegionSelector.MapView} Возвращает ссылку на себя.
     */
    setFocusOnRegion: function (index) {
        this._map.setBounds(
            this._regions.get(index).geometry.getBounds(), {
                checkZoomRange: true
                //, duration: 1000
            }
        );

        return this;
    },
    /**
     * Выставляем карте область видимости по всем регионам.
     * @function
     * @name RegionSelector.MapView.setFocusOnRegions
     * @returns {RegionSelector.MapView} Возвращает ссылку на себя.
     */
    setFocusOnRegions: function () {
        this._map.setBounds(this._regions.getBounds());

        return this;
    }
};

/**
 * Цвет областей региона.
 * @static
 * @constant
 */
RegionSelector.MapView.COLOR = 'rgba(0,102,255,0.6)';
/**
 * Цвет выделенной области.
 * @static
 * @constant
 */
RegionSelector.MapView.SELECTED_COLOR = 'rgba(255,153,153,1)';
