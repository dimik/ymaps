/**
 * Класс-модель
 * @class
 * @name RegionSelector.Model
 */
RegionSelector.Model = function () {
    this.events = new ymaps.event.Manager();
    this.options = new ymaps.option.Manager({
        preset: this.getDefaults()
    });
    this._monitor = new ymaps.Monitor(this.options);

    this._setupMonitor();
};

/**
 * @lends RegionSelector.Model.prototype
 */
RegionSelector.Model.prototype = {
    /**
     * @contructor
     */
    constructor: RegionSelector.Model,
    /**
     * Используем ymaps.Monitor для наблюдения за изменениями опций модели.
     * @function
     * @private
     * @name RegionSelector.Model._setupMonitor
     */
    _setupMonitor: function () {
        this._monitor
            .add(['country', 'lang', 'level'], function (newValues, oldValues) {
                /**
                 * Хак для смены языка при смене страны.
                 */
                if(newValues.country !== oldValues.country) {
                    this.options.unset('lang');
                }
                this.load();
            }, this, this.getDefaults());
    },
    /**
     * Отключение мониторинга опций модели.
     * @function
     * @private
     * @name RegionSelector.Model._clearMonitor
     */
    _clearMonitor: function () {
        this._monitor
            .removeAll();
    },
    /**
     * Загружаем данные.
     * @function
     * @name RegionSelector.Model.load
     */
    load: function () {
        ymaps.regions.load(
            this.options.get('country'), {
                lang: this.options.get('lang'),
                level: this.options.get('level')
            }
        ).then(
            ymaps.util.bind(this._onDataLoaded, this)
        );
    },
    /**
     * Обработчик загрузки данных.
     * @function
     * @private
     * @name RegionSelector.Model._onDataLoaded
     * @param {Object} data Данные региона.
     */
    _onDataLoaded: function (data) {
        this.events.fire('load', {
            regions: data.geoObjects,
            target: this
        });
    },
    /**
     * Опции модели по-умолчанию.
     * @function
     * @name RegionSelector.Model.getDefaults
     * @returns {Object} Опции модели.
     */
    getDefaults: function () {
        return {
            country: 'RU',
            lang: 'ru',
            level: 0
        };
    }
};
