ym.modules.define('LocationTool.component.DomView', [
    'util.defineClass'
], function (provide, defineClass) {
    /**
     * Класс DOM-отображения Инструмента определения координат.
     * @class
     * @name DOMView
     */
    var DOMView = defineClass(function () {
        this._element = $('form');
    }, /** @lends DOMView.prototype */{
        /**
         * Отображаем изменений данных в DOM-структуре.
         * @function
         * @name DOMView.render
         * @param {Object} data Объект с полями "mapCenter", "mapZoom" и "markerPosition".
         */
        render: function (data) {
            $.each(data, $.proxy(this._setData, this));
        },
        /**
         * Очистка DOM-отображения.
         * @function
         * @private
         * @name DOMView.clear
         */
        clear: function () {
            this._element.remove();
        },
        /**
         * Форматируем координату до 6-ти точек после запятой.
         * @function
         * @private
         * @name DOMView._toFixedNumber
         * @param {Number|String} coords Широта или Долгота.
         * @returns {Number} Число фиксированной длины.
         */
        _toFixedNumber: function (coords) {
            return Number(coords).toFixed(8);
        },
        /**
         * Обновление значений полей формы.
         * @function
         * @private
         * @name DOMView._setData
         * @param {String} id Идентификатор поля.
         * @param {Number|String} value Новое значение поля.
         */
        _setData: function (id, value) {
            this._element
                .find('#' + id)
                .val(
                    $.isArray(value)?
                        $.map(value, this._toFixedNumber).join(', ') : value
                );
        }
    });

    provide(DOMView);
});
