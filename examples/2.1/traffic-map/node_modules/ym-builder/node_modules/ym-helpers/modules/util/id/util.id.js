if (typeof modules == 'undefined' && typeof require == 'function') {
    var modules = require('ym');
}

modules.define("util.id", [], function (provide) {
    /**
     * @ignore
     * @name util.id
     */

    var id = new function () {
        /* Префикс, имеет три применения:
         * как префикс при генерации уникальных id, он призван давать уникальность при каждом запуске страницы
         * как имя свойства в котором хранятся id выданный объекту
         * как id для window
         */
        // http://jsperf.com/new-date-vs-date-now-vs-performance-now/6
        var prefix = ('id_' + (+(new Date())) + Math.round(Math.random() * 10000)).toString(),
            counterId = Math.round(Math.random() * 10000);

        function gen () {
            return (++counterId).toString();
        }

        /**
         * @ignore
         * Возвращает префикс, который используется как имя поля.
         * @return {String}
         */
        this.prefix = function () {
            return prefix;
        };

        /**
         * @ignore
         * Генерирует случайный ID. Возвращает результат в виде строки символов.
         * @returns {String} ID
         * @example
         * util.id.gen(); // -> '45654654654654'
         */
        this.gen = gen;

        /**
         * @ignore
         * Генерирует id и присваивает его свойству id переданного объекта. Если свойство id объекта существует,
         * то значение этого свойства не изменяется. Возвращает значение id в виде строки.
         * @param {Object} object Объект
         * @returns {String} ID
         */
        this.get = function (object) {
            return object === window ? prefix : object[prefix] || (object[prefix] = gen());
        };
    };

    provide(id);
});