ym.modules.define('RS.Model', [
  'util.defineClass',
  'util.bind',
  'Monitor',
  'option.Manager',
  'event.Manager',
  'regions'
], function (provide, defineClass, bind, Monitor, OptionManager, EventManager, Regions) {

/**
 * Класс-модель
 * @class
 * @name RegionSelector.Model
 */
var Model = defineClass(function () {
    this.events = new EventManager();
    this.options = new OptionManager({
        preset: this.getDefaults()
    });
    this._monitor = new Monitor(this.options);

    this._setupMonitor();
}, /** @lends RegionSelector.Model.prototype */{
    /**
     * Используем ymaps.Monitor для наблюдения за изменениями опций модели.
     * @function
     * @private
     * @name RegionSelector.Model._setupMonitor
     */
    _setupMonitor: function () {
        this._monitor
            .add(['country', 'lang', 'quality'], function (newValues, oldValues) {
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
        Regions.load(
            this.options.get('country'), {
                lang: this.options.get('lang'),
                quality: this.options.get('quality')
            }
        ).then(
            bind(this._onDataLoaded, this)
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
            quality: 0
        };
    }
});

provide(Model);

});
